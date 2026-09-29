import { adminLoginKey, clearAdminSession, createAdminSession, sameOrigin, verifyAdminCredentials } from "../../../../lib/admin-auth";
import { supabaseRest } from "../../../../lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  if (typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 256) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  try {
    const allowed = await supabaseRest<boolean>("rpc/allow_admin_login", { method: "POST", body: JSON.stringify({ p_key: adminLoginKey(request) }) });
    if (!allowed) return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    if (!verifyAdminCredentials(body.email, body.password)) return Response.json({ error: "Invalid credentials" }, { status: 401 });
    await createAdminSession();
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Admin login is not configured" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  await clearAdminSession();
  return Response.json({ ok: true });
}
