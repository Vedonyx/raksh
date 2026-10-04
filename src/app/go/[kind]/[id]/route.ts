import { contentTables } from "../../../../lib/creator-store";
import { recordEvent, publicPath } from "../../../../lib/creator-analytics";
import { destination, uuidPattern } from "../../../../lib/creator-validation";
import { supabaseRest } from "../../../../lib/supabase";
import type { ContentKind } from "../../../../lib/creator-types";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const { kind, id } = await params;
  if (
    !["video", "videoLink", "pageLink"].includes(kind) ||
    !uuidPattern.test(id)
  )
    return new Response("Link not found", { status: 404 });
  try {
    const items = await supabaseRest<
      { youtube_id?: string; url?: string; parent_id?: string }[]
    >(
      `${contentTables[kind as ContentKind]}?id=eq.${id}&published=eq.true&archived=eq.false&select=*&limit=1`,
    );
    const item = items[0];
    if (!item) return new Response("Link not found", { status: 404 });
    if (item.parent_id) {
      const table =
        kind === "videoLink" ? "creator_videos" : "creator_link_pages";
      const parents = await supabaseRest<{ id: string }[]>(
        `${table}?id=eq.${item.parent_id}&published=eq.true&archived=eq.false&select=id&limit=1`,
      );
      if (!parents[0]) return new Response("Link not found", { status: 404 });
    }
    const url =
      kind === "video"
        ? `https://www.youtube.com/watch?v=${item.youtube_id}`
        : destination(item.url);
    let path = "/links";
    try {
      const from = new URL(request.headers.get("referer") || "");
      if (from.origin === new URL(request.url).origin)
        path = publicPath(from.href) || path;
    } catch {}
    try {
      await recordEvent(request, { path, kind, target: id });
    } catch {
      console.error("Click tracking temporarily unavailable");
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(url, request.url).href,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    return new Response(
      "This link is temporarily unavailable. Please try again.",
      { status: 503 },
    );
  }
}
