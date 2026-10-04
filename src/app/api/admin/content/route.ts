import { hasAdminSession, sameOrigin } from "../../../../lib/admin-auth";
import { contentTables, getContent } from "../../../../lib/creator-store";
import {
  destination,
  pageSlug,
  textField,
  uuidPattern,
  youtubeId,
} from "../../../../lib/creator-validation";
import type { ContentKind } from "../../../../lib/creator-types";
import { supabaseRest } from "../../../../lib/supabase";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET() {
  if (!(await hasAdminSession()))
    return Response.json(
      { error: "Sign in to continue." },
      { status: 401, headers },
    );
  try {
    return Response.json(await getContent(true), { headers });
  } catch {
    return Response.json(
      { error: "Could not load content. Please refresh." },
      { status: 503, headers },
    );
  }
}
async function mutate(request: Request) {
  if (!(await hasAdminSession()))
    return Response.json(
      { error: "Sign in to continue." },
      { status: 401, headers },
    );
  if (!sameOrigin(request))
    return Response.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  try {
    const raw = await request.text();
    if (raw.length > 16000) throw new Error("Request is too large.");
    const body = JSON.parse(raw);
    const kind = body.kind as ContentKind;
    if (!Object.hasOwn(contentTables, kind))
      throw new Error("Choose a valid content type.");
    const table = contentTables[kind];
    if (body.action === "reorder") {
      if (
        kind === "page" ||
        !Array.isArray(body.ids) ||
        !body.ids.every(
          (id: unknown) => typeof id === "string" && uuidPattern.test(id),
        ) ||
        body.ids.length > 1000
      )
        throw new Error("Invalid order.");
      if (kind !== "video" && !uuidPattern.test(body.parent_id || ""))
        throw new Error("Select a parent first.");
      await supabaseRest("rpc/reorder_creator_content", {
        method: "POST",
        body: JSON.stringify({
          p_kind: kind,
          p_parent: kind === "video" ? null : body.parent_id,
          p_ids: body.ids,
        }),
      });
      return Response.json({ ok: true }, { headers });
    }
    const updating = request.method === "PATCH" || request.method === "DELETE";
    if (updating && !uuidPattern.test(body.id || ""))
      throw new Error("Invalid item ID.");
    const current = updating
      ? (
          await supabaseRest<Record<string, unknown>[]>(
            `${table}?id=eq.${body.id}&select=*&limit=1`,
          )
        )[0]
      : null;
    if (updating && !current)
      return Response.json(
        { error: "This item no longer exists." },
        { status: 404, headers },
      );
    if (request.method === "DELETE") {
      if (kind === "page" && current?.slug === "links")
        throw new Error("The main /links page cannot be archived.");
      await supabaseRest(`${table}?id=eq.${body.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          archived: true,
          updated_at: new Date().toISOString(),
        }),
      });
      return Response.json({ ok: true }, { headers });
    }
    const data = { ...current, ...body.data };
    if (
      typeof data.published !== "boolean" ||
      (data.archived !== undefined && typeof data.archived !== "boolean")
    )
      throw new Error("Choose draft or published.");
    const value: Record<string, unknown> = {
      published: data.published,
      archived: data.archived || false,
      updated_at: new Date().toISOString(),
    };
    if (kind === "page" || kind === "video") {
      value.title = textField(data.title, "Title", 160, true);
      value.description = textField(
        data.description || "",
        "Description",
        1200,
      );
      if (kind === "page") {
        value.slug = pageSlug(data.slug);
        if (
          (current?.slug === "links" && value.slug !== "links") ||
          (!current && value.slug === "links")
        )
          throw new Error("The main /links shortcut is reserved.");
        const existing = await supabaseRest<{ id: string }[]>(
          `creator_link_pages?slug=eq.${value.slug}&select=id&limit=1`,
        );
        if (existing[0] && existing[0].id !== body.id)
          return Response.json(
            { error: "This shortcut already exists. Choose another." },
            { status: 409, headers },
          );
      } else {
        value.youtube_id = youtubeId(data.youtube_id);
        if (!["short", "long"].includes(data.format))
          throw new Error("Choose Shorts or long-form.");
        value.format = data.format;
      }
    } else {
      value.label = textField(data.label, "Link label", 160, true);
      value.description = textField(data.description || "", "Description", 300);
      value.url = destination(data.url);
      if (!uuidPattern.test(data.parent_id || ""))
        throw new Error("Select a video or link page first.");
      if (current && current.parent_id !== data.parent_id)
        throw new Error("A link cannot be moved to another parent.");
      const parentTable =
        kind === "videoLink" ? "creator_videos" : "creator_link_pages";
      const parent = await supabaseRest<{ id: string }[]>(
        `${parentTable}?id=eq.${data.parent_id}&archived=eq.false&select=id&limit=1`,
      );
      if (!parent[0])
        throw new Error("The selected parent is archived or missing.");
      value.parent_id = data.parent_id;
    }
    if (!updating && kind !== "page") {
      const parent = kind === "video" ? "" : `&parent_id=eq.${value.parent_id}`;
      const last = await supabaseRest<{ position: number }[]>(
        `${table}?select=position&order=position.desc&limit=1${parent}`,
      );
      value.position = (last[0]?.position || 0) + 1;
    }
    const items = await supabaseRest(
      `${table}${updating ? `?id=eq.${body.id}` : ""}`,
      {
        method: updating ? "PATCH" : "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(value),
      },
    );
    return Response.json(
      { ok: true, items },
      { status: updating ? 200 : 201, headers },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save.";
    return Response.json(
      {
        error:
          message === "Database request failed"
            ? "Could not save. The list may have changed; refresh and try again."
            : message,
      },
      { status: message === "Database request failed" ? 409 : 400, headers },
    );
  }
}
export const POST = mutate;
export const PATCH = mutate;
export const DELETE = mutate;
