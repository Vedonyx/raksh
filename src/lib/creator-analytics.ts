import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { supabaseRest } from "./supabase";
function hash(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Tracking configuration is missing.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
async function identity(name: string, age: number) {
  const jar = await cookies();
  const token = jar.get(name)?.value;
  let id: string | undefined;
  if (token) {
    const [value, signature] = token.split(".");
    const expected = Buffer.from(hash(`${name}:${value}`));
    const actual = Buffer.from(signature || "");
    if (
      /^[\w-]{36}$/.test(value) &&
      actual.length === expected.length &&
      timingSafeEqual(actual, expected)
    )
      id = value;
  }
  id ||= randomUUID();
  jar.set(name, `${id}.${hash(`${name}:${id}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: age,
  });
  return hash(`${name}:${id}`);
}
export function publicPath(value: string) {
  try {
    const path = new URL(value, "https://local.invalid").pathname;
    return path.length <= 180 && !/^\/(admin|api|go|_next)(\/|$)/i.test(path)
      ? path
      : null;
  } catch {
    return null;
  }
}
export async function recordEvent(
  request: Request,
  input: {
    id?: string;
    path: string;
    referrer?: string;
    kind?: string;
    target?: string;
  },
) {
  if (request.method === "HEAD") return;
  if (
    request.headers.get("dnt") === "1" ||
    request.headers.get("sec-gpc") === "1" ||
    /bot|crawler|spider|headless|preview|facebookexternalhit/i.test(
      request.headers.get("user-agent") || "",
    )
  )
    return;
  if (
    request.headers.has("next-router-prefetch") ||
    /prefetch/i.test(
      request.headers.get("purpose") ||
        request.headers.get("sec-purpose") ||
        "",
    )
  )
    return;
  const path = publicPath(input.path);
  if (!path) return;
  const visitor = await identity("rj_visitor", 60 * 60 * 24 * 30);
  const session = await identity("rj_visit", 60 * 30);
  let source = "";
  try {
    const url = new URL(input.referrer || request.headers.get("referer") || "");
    if (
      url.origin !== new URL(request.url).origin &&
      ["http:", "https:"].includes(url.protocol)
    )
      source = url.hostname.slice(0, 253);
  } catch {}
  const ua = request.headers.get("user-agent") || "";
  const device = /ipad|tablet/i.test(ua)
    ? "tablet"
    : /mobile|android|iphone/i.test(ua)
      ? "mobile"
      : "desktop";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  await supabaseRest("rpc/record_creator_event", {
    method: "POST",
    body: JSON.stringify({
      p_key: hash(`rate:${ip}`),
      p_event: {
        id: input.id || randomUUID(),
        event_type: input.target ? "outbound_click" : "page_view",
        visitor_hash: visitor,
        session_hash: session,
        path,
        referrer_host: source,
        device,
        target_kind: input.kind || null,
        target_id: input.target || null,
      },
    }),
  });
}
