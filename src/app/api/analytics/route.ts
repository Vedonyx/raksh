import { sameOrigin } from "../../../lib/admin-auth";
import { publicPath, recordEvent } from "../../../lib/creator-analytics";
import { uuidPattern } from "../../../lib/creator-validation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 2500) return new Response(null, { status: 413 });
    const body = JSON.parse(raw);
    if (
      typeof body.path !== "string" ||
      !publicPath(body.path) ||
      !uuidPattern.test(body.id || "") ||
      (body.referrer &&
        (typeof body.referrer !== "string" || body.referrer.length > 2048))
    )
      return new Response(null, { status: 400 });
    await recordEvent(request, body);
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
