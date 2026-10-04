import { hasAdminSession } from "../../../../lib/admin-auth";
import { supabaseRest } from "../../../../lib/supabase";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  if (!(await hasAdminSession()))
    return Response.json(
      { error: "Sign in to continue." },
      { status: 401, headers },
    );
  const days = Number(new URL(request.url).searchParams.get("days") || 30);
  if (![7, 30, 90].includes(days))
    return Response.json(
      { error: "Choose 7, 30 or 90 days." },
      { status: 400, headers },
    );
  try {
    return Response.json(
      await supabaseRest("rpc/creator_analytics_summary", {
        method: "POST",
        body: JSON.stringify({ p_days: days }),
      }),
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Traffic data could not load. Please refresh." },
      { status: 503, headers },
    );
  }
}
