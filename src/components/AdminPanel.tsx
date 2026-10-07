"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { Lead, LeadStatus } from "../lib/supabase";
import type { AnalyticsSummary, ContentSnapshot } from "../lib/creator-types";
import AdminContentManager from "./AdminContentManager";
const statuses: LeadStatus[] = ["new", "contacted", "qualified", "closed"];
const number = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const date = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
const emptyContent: ContentSnapshot = {
  videos: [],
  videoLinks: [],
  pages: [],
  pageLinks: [],
};
type View = "overview" | "enquiries" | "videos" | "pages";
const nav: { key: View; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "◫" },
  { key: "enquiries", label: "Enquiries", icon: "☷" },
  { key: "videos", label: "Videos & referrals", icon: "▷" },
  { key: "pages", label: "Link pages", icon: "↗" },
];
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Your session expired. Please sign in again."
        : data.error || "Could not complete the request.",
    );
  return data;
}
function Breakdown({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; count: number }[];
  total: number;
}) {
  return (
    <section className="workspace-panel workspace-breakdown">
      <div className="workspace-panel-title">
        <h3>{title}</h3>
        <span>{number(total)} views</span>
      </div>
      {rows.length ? (
        rows.map((row) => (
          <div className="workspace-breakdown-row" key={row.label}>
            <div>
              <span>{row.label}</span>
              <b>{number(row.count)}</b>
            </div>
            <div className="workspace-progress">
              <span
                style={{ width: `${total ? (row.count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="workspace-soft-empty">
          Visits will appear here once tracking begins.
        </p>
      )}
    </section>
  );
}
function TrafficChart({ analytics }: { analytics: AnalyticsSummary }) {
  const [details, setDetails] = useState(false);
  const points = analytics.daily;
  const maximum = Math.max(
    3,
    Math.ceil(
      Math.max(0, ...points.map((x) => Math.max(x.views, x.clicks))) / 3,
    ) * 3,
  );
  const coordinate = (i: number, value: number) =>
    `${48 + (i * 704) / Math.max(1, points.length - 1)},${188 - (value / maximum) * 155}`;
  return (
    <section className="workspace-panel workspace-traffic">
      <div className="workspace-panel-title">
        <div>
          <h3>Traffic over time</h3>
          <p>Website views and outbound link clicks</p>
        </div>
        <div className="workspace-chart-key">
          <span>
            <i />
            Views
          </span>
          <span>
            <i />
            Clicks
          </span>
        </div>
      </div>
      <svg
        className="workspace-chart"
        viewBox="0 0 800 230"
        role="img"
        aria-label={`Daily traffic: ${number(analytics.views)} views and ${number(analytics.clicks)} clicks. Use the daily numbers below for details.`}
      >
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1="48"
              y1={188 - (i * 155) / 3}
              x2="752"
              y2={188 - (i * 155) / 3}
              stroke="#213044"
              strokeDasharray="3 5"
            />
            <text x="8" y={192 - (i * 155) / 3} fill="#7a8da6" fontSize="11">
              {number(Math.round((maximum * i) / 3))}
            </text>
          </g>
        ))}
        <polygon
          points={`48,188 ${points.map((p, i) => coordinate(i, p.views)).join(" ")} 752,188`}
          fill="url(#traffic-fill)"
        />
        <defs>
          <linearGradient id="traffic-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#519bff" stopOpacity=".25" />
            <stop offset="100%" stopColor="#519bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="#72b0ff"
          strokeWidth="2.5"
          points={points.map((p, i) => coordinate(i, p.views)).join(" ")}
        />
        <polyline
          fill="none"
          stroke="#58cfba"
          strokeWidth="2"
          points={points.map((p, i) => coordinate(i, p.clicks)).join(" ")}
        />
        {points.map((p, i) => (
          <circle
            key={p.day}
            cx={48 + (i * 704) / Math.max(1, points.length - 1)}
            cy={188 - (p.views / maximum) * 155}
            r="4"
            fill="#8fc3ff"
          >
            <title>
              {date(`${p.day}T12:00:00+05:30`)}: {p.views} views, {p.clicks}{" "}
              clicks
            </title>
          </circle>
        ))}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((i) => (
            <text
              x={48 + (i * 704) / Math.max(1, points.length - 1)}
              y="219"
              fill="#7a8da6"
              fontSize="11"
              textAnchor={
                i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
              }
              key={i}
            >
              {date(`${points[i]?.day}T12:00:00+05:30`)}
            </text>
          ))}
      </svg>
      <button
        className="workspace-text-button"
        type="button"
        onClick={() => setDetails(!details)}
        aria-expanded={details}
      >
        {details ? "Hide" : "View"} daily numbers {details ? "↑" : "↓"}
      </button>
      {details && (
        <div className="workspace-daily-table">
          <table>
            <thead>
              <tr>
                <th>Date (IST)</th>
                <th>Views</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.day}>
                  <td>{date(`${p.day}T12:00:00+05:30`)}</td>
                  <td>{number(p.views)}</td>
                  <td>{number(p.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
export default function AdminPanel({ signedIn }: { signedIn: boolean }) {
  const [authenticated, setAuthenticated] = useState(signedIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<View>("overview");
  const [days, setDays] = useState(30);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [content, setContent] = useState<ContentSnapshot>(emptyContent);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    try {
      const [enquiries, resources, traffic] = await Promise.all([
        api<{ leads: Lead[] }>("/api/admin/leads"),
        api<ContentSnapshot>("/api/admin/content"),
        api<AnalyticsSummary>(`/api/admin/analytics?days=${days}`),
      ]);
      setLeads(enquiries.leads);
      setContent(resources);
      setAnalytics(traffic);
    } finally {
      setLoading(false);
    }
  }, [days]);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    load().catch((error) => {
      if (active) {
        setMessage(error.message);
        if (error.message.includes("session expired")) setAuthenticated(false);
      }
    });
    return () => {
      active = false;
    };
  }, [authenticated, load]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api("/api/admin/session", { method: "DELETE" });
      setAuthenticated(false);
      setLeads([]);
      setContent(emptyContent);
      setAnalytics(null);
      setMessage("");
    } catch {
      setMessage("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function act(method: string, body: unknown) {
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/content", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setContent(await api<ContentSnapshot>("/api/admin/content"));
      setMessage(
        method === "DELETE"
          ? "Archived. You can restore this item anytime."
          : "Saved. Published changes are live on the website.",
      );
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function save(lead: Lead) {
    setBusy(true);
    setMessage("");
    try {
      const data = await api<{ lead: Lead }>("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          status: lead.status,
          admin_note: lead.admin_note || "",
        }),
      });
      setLeads((prev) => prev.map((x) => (x.id === lead.id ? data.lead : x)));
      setMessage("Enquiry updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  const visible = useMemo(
    () =>
      leads.filter(
        (x) =>
          (filter === "all" || x.status === filter) &&
          `${x.name} ${x.email} ${x.whatsapp || ""} ${x.module} ${x.goal || ""}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [leads, query, filter],
  );
  const current = visible.find((x) => x.id === selected) || visible[0];
  const periodStart = analytics?.daily[0]
    ? new Date(`${analytics.daily[0].day}T00:00:00+05:30`).getTime()
    : Infinity;
  const periodLeads = leads.filter(
    (x) => new Date(x.created_at).getTime() >= periodStart,
  );
  const clicks = (kind: string, id: string) =>
    analytics?.targets.find((x) => x.kind === kind && x.id === id)?.count || 0;
  const updateLead = (field: Partial<Lead>) => {
    if (current)
      setLeads((prev) =>
        prev.map((x) => (x.id === current.id ? { ...x, ...field } : x)),
      );
  };
  if (!authenticated)
    return (
      <div className="admin-shell workspace-login">
        <div className="workspace-login__story">
          <Link href="/" className="workspace-brand">
            RAKSHIT <span>JAIN</span>
          </Link>
          <div>
            <span className="workspace-eyebrow">
              YOUR CREATOR BUSINESS, IN ONE PLACE
            </span>
            <h1>
              Make the next
              <br />
              move <em>count.</em>
            </h1>
            <p>
              Your audience. Your links. Your conversations.
              <br />A clearer view of what is working.
            </p>
          </div>
          <span className="workspace-login__footer">
            PRIVATE WORKSPACE · RAKSHIT JAIN
          </span>
        </div>
        <div className="workspace-login__form">
          <form onSubmit={login}>
            <span className="workspace-login__symbol">↗</span>
            <p className="workspace-eyebrow">ADMIN ACCESS</p>
            <h2>Welcome back.</h2>
            <p>Sign in to manage your website.</p>
            <label>
              Email address
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className="workspace-primary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to dashboard"} ↗
            </button>
            <p className="workspace-inline-status" role="status">
              {message}
            </p>
            <Link className="workspace-login__back" href="/">
              ← Back to website
            </Link>
          </form>
        </div>
      </div>
    );
  return (
    <div className="admin-shell workspace-dashboard">
      <aside className="workspace-sidebar">
        <Link href="/admin" className="workspace-brand">
          RAKSHIT <span>JAIN</span>
        </Link>
        <div className="workspace-workspace-label">
          <i /> Creator workspace
        </div>
        <nav aria-label="Dashboard navigation">
          {nav.map((item) => (
            <button
              type="button"
              key={item.key}
              aria-current={view === item.key ? "page" : undefined}
              onClick={() => {
                setView(item.key);
                setMessage("");
              }}
            >
              <span className="workspace-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
              {item.key === "enquiries" &&
                leads.some((x) => x.status === "new") && (
                  <b>{leads.filter((x) => x.status === "new").length}</b>
                )}
            </button>
          ))}
        </nav>
        <div className="workspace-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            View website <span>↗</span>
          </a>
          <p>
            Numbers from your actual visitors.
            <br />
            No estimates. No invented history.
          </p>
          <button type="button" disabled={busy} onClick={logout}>
            Sign out <span>↪</span>
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div>
            <span className="workspace-eyebrow">CREATOR WORKSPACE</span>
            <h1>{nav.find((x) => x.key === view)?.label}</h1>
          </div>
          <div className="workspace-topbar-actions">
            <select
              aria-label="Analytics period"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              disabled={loading}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              type="button"
              className="workspace-icon-button"
              aria-label="Refresh dashboard"
              disabled={loading || busy}
              onClick={() =>
                load()
                  .then(() => setMessage("Dashboard refreshed."))
                  .catch((e) => setMessage(e.message))
              }
            >
              ↻
            </button>
            <span className="workspace-account" title="Rakshit Jain">
              RJ
            </span>
          </div>
        </header>
        <div className="workspace-body">
          {message && (
            <p className="workspace-toast" role="status">
              {message}
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </p>
          )}
          {loading && (
            <p className="workspace-loading" role="status">
              Updating your workspace…
            </p>
          )}
          {view === "overview" && (
            <>
              <div className="workspace-welcome">
                <div>
                  <p className="workspace-eyebrow">THE BIG PICTURE</p>
                  <h2>Know what&apos;s moving.</h2>
                  <p>
                    A live view of your website, links and creator enquiries.
                  </p>
                </div>
                <a
                  href="/links"
                  target="_blank"
                  rel="noreferrer"
                  className="workspace-outline"
                >
                  Open your link page ↗
                </a>
              </div>
              <div className="workspace-kpis">
                {[
                  {
                    label: "Website views",
                    value: analytics?.views,
                    note: "Pages viewed on the website",
                    icon: "◫",
                  },
                  {
                    label: "Unique visitors",
                    value: analytics?.visitors,
                    note: `${analytics ? number(analytics.sessions) : "—"} browsing sessions`,
                    icon: "◎",
                  },
                  {
                    label: "Referral clicks",
                    value: analytics?.referral_clicks,
                    note: `${analytics ? number(analytics.clicks) : "—"} total outbound clicks`,
                    icon: "↗",
                  },
                  {
                    label: "New enquiries",
                    value: analytics ? periodLeads.length : undefined,
                    note: "Consultation requests in this period",
                    icon: "☷",
                  },
                ].map((k) => (
                  <article className="workspace-kpi" key={k.label}>
                    <div>
                      <span>{k.label}</span>
                      <i aria-hidden="true">{k.icon}</i>
                    </div>
                    <strong>
                      {k.value === undefined ? "—" : number(k.value)}
                    </strong>
                    <small>{k.note}</small>
                  </article>
                ))}
              </div>
              {analytics && (
                <>
                  <TrafficChart analytics={analytics} />
                  <div className="workspace-insights-grid">
                    <Breakdown
                      title="Top pages"
                      rows={analytics.pages}
                      total={analytics.views}
                    />
                    <Breakdown
                      title="Traffic sources"
                      rows={analytics.sources}
                      total={analytics.views}
                    />
                    <Breakdown
                      title="Devices"
                      rows={analytics.devices}
                      total={analytics.views}
                    />
                  </div>
                </>
              )}
              <div className="workspace-overview-bottom">
                <section className="workspace-panel">
                  <div className="workspace-panel-title">
                    <h3>Latest enquiries</h3>
                    <button
                      type="button"
                      className="workspace-text-button"
                      onClick={() => setView("enquiries")}
                    >
                      View all →
                    </button>
                  </div>
                  {leads.length ? (
                    <div className="workspace-recent-leads">
                      {leads.slice(0, 5).map((lead) => (
                        <button
                          type="button"
                          key={lead.id}
                          onClick={() => {
                            setSelected(lead.id);
                            setFilter("all");
                            setQuery("");
                            setView("enquiries");
                          }}
                        >
                          <span className="workspace-initial">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <strong>{lead.name}</strong>
                            <small>
                              Module {lead.module} · {date(lead.created_at)}
                            </small>
                          </span>
                          <span className={`workspace-badge workspace-badge--${lead.status}`}>
                            {lead.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="workspace-soft-empty">
                      Your next conversation starts here. New form submissions
                      appear automatically.
                    </p>
                  )}
                </section>
                <section className="workspace-panel workspace-workspace-health">
                  <div className="workspace-panel-title">
                    <h3>Your publishing desk</h3>
                    <span className="workspace-live-dot">Connected</span>
                  </div>
                  <button type="button" onClick={() => setView("videos")}>
                    <span>Published videos</span>
                    <b>
                      {
                        content.videos.filter((x) => x.published && !x.archived)
                          .length
                      }{" "}
                      ↗
                    </b>
                  </button>
                  <button type="button" onClick={() => setView("pages")}>
                    <span>Published link pages</span>
                    <b>
                      {
                        content.pages.filter((x) => x.published && !x.archived)
                          .length
                      }{" "}
                      ↗
                    </b>
                  </button>
                  <button type="button" onClick={() => setView("enquiries")}>
                    <span>Awaiting a first reply</span>
                    <b>{leads.filter((x) => x.status === "new").length} ↗</b>
                  </button>
                  <p>
                    Traffic is measured from{" "}
                    {analytics?.first_event
                      ? date(analytics.first_event)
                      : "the first tracked visit"}
                    . Visits blocked by privacy settings and obvious bots are
                    excluded. All times are IST.
                  </p>
                </section>
              </div>
            </>
          )}
          {view === "enquiries" && (
            <>
              <div className="workspace-section-heading">
                <div>
                  <h2>Turn a request into a conversation.</h2>
                  <p>
                    Manage consultation enquiries, follow-ups and private notes.
                    No payment has been collected.
                  </p>
                </div>
                <Link
                  className="workspace-outline"
                  prefetch={false}
                  download
                  href="/api/admin/leads?format=csv"
                >
                  Export CSV ↓
                </Link>
              </div>
              <div className="workspace-enquiry-counts">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={filter === status}
                    onClick={() =>
                      setFilter(filter === status ? "all" : status)
                    }
                  >
                    <span>{status}</span>
                    <strong>
                      {leads.filter((x) => x.status === status).length}
                    </strong>
                  </button>
                ))}
              </div>
              <div className="workspace-search">
                <input
                  type="search"
                  aria-label="Search enquiries"
                  placeholder="Search name, email, module or goal…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  value={filter}
                  aria-label="Filter enquiry status"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <span>{visible.length} results</span>
              </div>
              <div className="workspace-enquiries-grid">
                <section className="workspace-panel workspace-enquiry-list">
                  <div className="workspace-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Person</th>
                          <th>Module</th>
                          <th>Status</th>
                          <th>Received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((lead) => (
                          <tr
                            key={lead.id}
                            className={
                              current?.id === lead.id ? "is-selected" : ""
                            }
                          >
                            <td>
                              <button
                                type="button"
                                onClick={() => setSelected(lead.id)}
                              >
                                <strong>{lead.name}</strong>
                                <small>{lead.email}</small>
                              </button>
                            </td>
                            <td>0{Number(lead.module)}</td>
                            <td>
                              <span
                                className={`workspace-badge workspace-badge--${lead.status}`}
                              >
                                {lead.status}
                              </span>
                            </td>
                            <td>{date(lead.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!visible.length && (
                    <p className="workspace-soft-empty">
                      No enquiries match this view.
                    </p>
                  )}
                </section>
                <section className="workspace-panel workspace-enquiry-detail">
                  {current ? (
                    <>
                      <span className="workspace-eyebrow">
                        MODULE {current.module} / ENQUIRY
                      </span>
                      <h3>{current.name}</h3>
                      <p className="workspace-detail-date">
                        {new Date(current.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })}{" "}
                        IST
                      </p>
                      <div className="workspace-contact-links">
                        <a href={`mailto:${current.email}`}>
                          {current.email} ↗
                        </a>
                        {current.whatsapp && (
                          <a
                            href={`https://wa.me/${current.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {current.whatsapp} ↗
                          </a>
                        )}
                      </div>
                      {current.preferred_date && (
                        <div className="workspace-detail-note">
                          <span>REQUESTED SLOT</span>
                          <p>
                            {current.preferred_date} · {current.preferred_time}{" "}
                            IST
                          </p>
                        </div>
                      )}
                      {current.goal && (
                        <div className="workspace-detail-note">
                          <span>THEIR GOAL</span>
                          <p>{current.goal}</p>
                        </div>
                      )}
                      <label>
                        Enquiry status
                        <select
                          value={current.status}
                          onChange={(e) =>
                            updateLead({ status: e.target.value as LeadStatus })
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Private follow-up note
                        <textarea
                          rows={4}
                          maxLength={2000}
                          value={current.admin_note || ""}
                          onChange={(e) =>
                            updateLead({ admin_note: e.target.value })
                          }
                          placeholder="Next step, call notes or follow-up date…"
                        />
                      </label>
                      <button
                        className="workspace-primary"
                        type="button"
                        disabled={busy}
                        onClick={() => save(current)}
                      >
                        {busy ? "Saving…" : "Save enquiry"} ↗
                      </button>
                    </>
                  ) : (
                    <p className="workspace-soft-empty">
                      Choose an enquiry to see its details.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
          {(view === "videos" || view === "pages") && (
            <AdminContentManager
              key={view}
              mode={view}
              content={content}
              clicks={clicks}
              busy={busy}
              message={message}
              act={act}
            />
          )}
          <footer className="workspace-footer">
            <span>Rakshit Jain · Private workspace</span>
            <span>Selected period: {days} days · IST</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
