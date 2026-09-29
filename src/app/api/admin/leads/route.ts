import { hasAdminSession, sameOrigin } from "../../../../lib/admin-auth";
import { supabaseRest, type Lead, type LeadStatus } from "../../../../lib/supabase";

export const runtime = "nodejs";

const fields = "id,created_at,updated_at,name,email,whatsapp,module,preferred_date,preferred_time,goal,status,admin_note";
const statuses: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

async function allLeads() {
  const leads: Lead[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await supabaseRest<Lead[]>(`presale_leads?select=${fields}&order=created_at.desc&limit=1000&offset=${offset}`);
    leads.push(...page);
    if (page.length < 1000) return leads;
  }
}

function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/^[=+@\-]/, "'$&");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (!await hasAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const leads = await allLeads();
    if (new URL(request.url).searchParams.get("format") === "csv") {
      const header = ["Created", "Name", "Email", "WhatsApp", "Module", "Preferred date", "Preferred time", "Goal", "Status", "Admin note"];
      const lines = leads.map((lead) => [lead.created_at, lead.name, lead.email, lead.whatsapp, lead.module, lead.preferred_date, lead.preferred_time, lead.goal, lead.status, lead.admin_note].map(csvCell).join(","));
      return new Response([header.join(","), ...lines].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=raksh-presale-leads.csv", "Cache-Control": "private, no-store" } });
    }
    return Response.json({ leads }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Could not load leads" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!await hasAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  let body: { id?: unknown; status?: unknown; admin_note?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  if (typeof body.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(body.id) || !statuses.includes(body.status as LeadStatus) || typeof body.admin_note !== "string" || body.admin_note.length > 2000) {
    return Response.json({ error: "Invalid update" }, { status: 400 });
  }
  try {
    const updated = await supabaseRest<Lead[]>(`presale_leads?id=eq.${encodeURIComponent(body.id)}&select=${fields}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: body.status, admin_note: body.admin_note.trim() || null, updated_at: new Date().toISOString() }),
    });
    if (!updated.length) return Response.json({ error: "Lead not found" }, { status: 404 });
    return Response.json({ lead: updated[0] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Could not save lead" }, { status: 503 });
  }
}
