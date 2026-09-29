import { sameOrigin } from "../../../lib/admin-auth";
import { supabaseRest } from "../../../lib/supabase";

export const runtime = "nodejs";

function string(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max + 1) : "";
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "JSON required" }, { status: 415 });
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 8192) return Response.json({ error: "Request too large" }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid form data" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid form data" }, { status: 400 });
  if (body.website) return Response.json({ ok: true });

  const name = string(body.name, 120);
  const email = string(body.email, 254).toLowerCase();
  const whatsapp = string(body.whatsapp, 35);
  const selectedModule = string(body.module, 2);
  const goal = string(body.goal, 2000);
  const date = string(body.date, 10);
  const time = string(body.time, 5);
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !["01", "02", "03"].includes(selectedModule) || whatsapp.length > 35 || goal.length > 2000) {
    return Response.json({ error: "Please check the name, email and module" }, { status: 400 });
  }
  if ((date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) || (!!date !== !!time) || (date && (!Number.isFinite(new Date(`${date}T${time}:00+05:30`).getTime()) || new Date(`${date}T${time}:00+05:30`).getTime() <= Date.now()))) {
    return Response.json({ error: "Please choose a future preferred time, or leave both time fields blank" }, { status: 400 });
  }
  if (body.consent !== true) return Response.json({ error: "Please agree to be contacted" }, { status: 400 });

  try {
    await supabaseRest("presale_leads", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ name, email, whatsapp: whatsapp || null, module: selectedModule, preferred_date: date || null, preferred_time: time || null, goal: goal || null, consent_at: new Date().toISOString() }),
    });
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "We could not save your request. Please try again shortly." }, { status: 503 });
  }
}
