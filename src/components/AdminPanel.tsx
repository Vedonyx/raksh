"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Lead, LeadStatus } from "../lib/supabase";

const statuses: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

export default function AdminPanel({ signedIn }: { signedIn: boolean }) {
  const [authenticated, setAuthenticated] = useState(signedIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/leads", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); return; }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load leads");
    setLeads(data.leads);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/admin/leads", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) { setAuthenticated(false); return null; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load leads");
        return data.leads as Lead[];
      })
      .then((data) => { if (data) setLeads(data); })
      .catch((error) => setMessage(error.message));
  }, [authenticated]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      setPassword(""); setAuthenticated(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Login failed"); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setLeads([]); setAuthenticated(false);
  }

  async function save(lead: Lead) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status: lead.status, admin_note: lead.admin_note || "" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save");
      setLeads((current) => current.map((item) => item.id === lead.id ? data.lead : item));
      setMessage("Lead updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save"); }
    finally { setBusy(false); }
  }

  const visible = useMemo(() => leads.filter((lead) => {
    const matchesStatus = filter === "all" || lead.status === filter;
    const text = `${lead.name} ${lead.email} ${lead.whatsapp || ""} ${lead.module} ${lead.goal || ""}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  }), [leads, filter, query]);

  if (!authenticated) return <div className="admin-shell admin-login"><div className="admin-login__card"><p className="eyebrow">Raksh Jain / Private access</p><h1>Admin sign in</h1><p>View and manage pre-sales enquiries.</p><form onSubmit={login}><label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="pill-button" type="submit" disabled={busy}>Sign in ↗</button></form><p role="status">{message}</p></div></div>;

  return <div className="admin-shell"><div className="admin-wrap"><header className="admin-top"><div><p className="eyebrow">Raksh Jain / Private dashboard</p><h1>Pre-sales enquiries</h1><p>People who asked about a consultation. No payment has been collected.</p></div><button type="button" onClick={logout}>Sign out ↗</button></header><div className="admin-summary"><div><strong>{leads.length}</strong><span>Total requests</span></div><div><strong>{leads.filter((lead) => lead.status === "new").length}</strong><span>New</span></div><div><strong>{leads.filter((lead) => lead.status === "contacted").length}</strong><span>Contacted</span></div></div><div className="admin-controls"><input type="search" placeholder="Search name, email, module..." aria-label="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter status" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="button" onClick={() => load().catch((error) => setMessage(error.message))}>Refresh ↻</button><a href="/api/admin/leads?format=csv">Export CSV ↓</a></div><p className="admin-status" role="status">{message}</p><div className="admin-leads">{visible.length === 0 && <p className="admin-empty">No enquiries match this view.</p>}{visible.map((lead) => <article key={lead.id} className="admin-lead"><div className="admin-lead__head"><div><span className="eyebrow">Module {lead.module} · {new Date(lead.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span><h2>{lead.name}</h2></div><span className={`admin-badge admin-badge--${lead.status}`}>{lead.status}</span></div><div className="admin-lead__details"><a href={`mailto:${lead.email}`}>{lead.email} ↗</a>{lead.whatsapp && <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{lead.whatsapp} ↗</a>}{lead.preferred_date && <span>Preferred: {lead.preferred_date} at {lead.preferred_time} IST</span>}</div>{lead.goal && <p className="admin-lead__goal">{lead.goal}</p>}<div className="admin-lead__edit"><label>Status<select value={lead.status} onChange={(event) => setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item))}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label>Private note<textarea rows={2} value={lead.admin_note || ""} onChange={(event) => setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, admin_note: event.target.value } : item))} maxLength={2000} /></label><button type="button" disabled={busy} onClick={() => save(lead)}>Save changes ↗</button></div></article>)}</div></div></div>;
}
