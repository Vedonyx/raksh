import fs from "node:fs";
import { createHmac, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const i = line.indexOf("=");
  if (i > 0)
    process.env[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, "");
}
const payload = Buffer.from(
  JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
).toString("base64url");
const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
  .update(payload)
  .digest("base64url");
const cookie = `raksh_admin_session=${payload}.${signature}`;
const fixtures = {
  video: [],
  videoLink: [],
  page: [],
  pageLink: [],
  events: [],
};
function managementToken() {
  const token =
    process.env.SUPABASE_ACCESS_TOKEN ||
    fs
      .readFileSync(
        process.env.TEST_SUPABASE_MANAGEMENT_ENV || ".env.supabase-management",
        "utf8",
      )
      .match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m)?.[1]
      ?.trim();
  if (!token)
    throw new Error(
      "Set SUPABASE_ACCESS_TOKEN or TEST_SUPABASE_MANAGEMENT_ENV for disposable fixture cleanup.",
    );
  return token;
}
let browserCookie = "";
async function request(
  path,
  { method = "GET", body, auth = true, origin = base, extra = {} } = {},
) {
  const headers = { Origin: origin, ...extra };
  if (auth) headers.Cookie = cookie;
  if (body) headers["Content-Type"] = "application/json";
  const r = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  return r;
}
async function mutation(kind, data, id, method = id ? "PATCH" : "POST") {
  const r = await request("/api/admin/content", {
    method,
    body: { kind, id, data },
  });
  const result = await r.json();
  assert.ok(r.ok, JSON.stringify(result));
  if (!id && result.items?.[0]) fixtures[kind].push(result.items[0].id);
  return result.items?.[0];
}
async function cleanup() {
  // Remove only this run's disposable fixtures and events, never real content.
  const token = managementToken();
  const tables = {
    videoLink: "creator_video_links",
    pageLink: "creator_page_links",
    video: "creator_videos",
    page: "creator_link_pages",
    events: "creator_analytics_events",
  };
  const statements = [];
  for (const kind of ["videoLink", "pageLink", "video", "page", "events"])
    if (fixtures[kind].length)
      statements.push(
        `delete from public.${tables[kind]} where id in (${fixtures[kind].map((id) => `'${id}'::uuid`).join(",")});`,
      );
  if (statements.length) {
    const r = await fetch(
      "https://api.supabase.com/v1/projects/evdmhxxoiwmlnzjgrkwo/database/query",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: statements.join("\n"),
          read_only: false,
        }),
      },
    );
    assert.ok(r.ok, "Disposable fixture cleanup failed");
  }
}
try {
  for (const path of [
    "/api/admin/content",
    "/api/admin/analytics",
    "/api/admin/leads",
  ])
    assert.equal((await request(path, { auth: false })).status, 401);
  assert.equal(
    (
      await request("/api/admin/content", {
        method: "POST",
        body: { kind: "page", data: {} },
        origin: "https://untrusted.invalid",
      })
    ).status,
    403,
  );
  managementToken();
  const baseline = await (await request("/api/admin/content")).json();
  assert.ok(baseline.videos.filter((x) => !x.archived).length >= 6);
  const before = await (await request("/api/admin/analytics?days=7")).json();
  assert.equal(before.daily.length, 7);
  assert.ok(Number.isInteger(before.views));
  const slug = `qa-${randomUUID().slice(0, 8)}`;
  const page = await mutation("page", {
    title: "[QA] Disposable link page",
    description: "Integration test only",
    slug: slug.toUpperCase(),
    published: false,
  });
  assert.equal(page.slug, slug);
  assert.equal((await request("/" + slug, { auth: false })).status, 404);
  const a = await mutation("pageLink", {
    parent_id: page.id,
    label: "[QA] First",
    url: "/consultations",
    description: "",
    published: true,
  });
  const b = await mutation("pageLink", {
    parent_id: page.id,
    label: "[QA] Second",
    url: "https://example.com/?ref=creator",
    description: "",
    published: true,
  });
  assert.equal(
    (await request(`/go/pageLink/${a.id}`, { auth: false })).status,
    404,
  );
  await mutation("page", { published: true }, page.id);
  const rendered = await (
    await request("/" + slug.toUpperCase(), { auth: false })
  ).text();
  assert.ok(rendered.includes("[QA] First"));
  const order = await request("/api/admin/content", {
    method: "POST",
    body: {
      kind: "pageLink",
      action: "reorder",
      parent_id: page.id,
      ids: [b.id, a.id],
    },
  });
  assert.equal(order.status, 200);
  const changed = await (await request("/api/admin/content")).json();
  assert.deepEqual(
    changed.pageLinks.filter((x) => x.parent_id === page.id).map((x) => x.id),
    [b.id, a.id],
  );
  const stale = await request("/api/admin/content", {
    method: "POST",
    body: {
      kind: "pageLink",
      action: "reorder",
      parent_id: page.id,
      ids: [b.id],
    },
  });
  assert.equal(stale.status, 409);
  const collision = await request("/api/admin/content", {
    method: "POST",
    body: {
      kind: "page",
      data: { title: "Duplicate", description: "", slug, published: false },
    },
  });
  assert.equal(collision.status, 409);
  const reserved = await request("/api/admin/content", {
    method: "POST",
    body: {
      kind: "page",
      data: {
        title: "Wrong",
        description: "",
        slug: "admin",
        published: false,
      },
    },
  });
  assert.equal(reserved.status, 400);
  const unsafe = await request("/api/admin/content", {
    method: "POST",
    body: {
      kind: "pageLink",
      data: {
        parent_id: page.id,
        label: "Bad",
        description: "",
        url: "javascript:alert(1)",
        published: true,
      },
    },
  });
  assert.equal(unsafe.status, 400);
  const video = await mutation("video", {
    title: "[QA] Disposable video",
    description: "Not a real publication",
    youtube_id: "https://youtu.be/aIoVDZAW85w?x=1",
    format: "short",
    published: false,
  });
  assert.equal(video.youtube_id, "aIoVDZAW85w");
  const referral = await mutation("videoLink", {
    parent_id: video.id,
    label: "[QA] Referral",
    url: "https://example.com/?tag=qa",
    description: "QA",
    published: true,
  });
  assert.ok(
    !(await (await request("/videos", { auth: false })).text()).includes(
      "[QA] Referral",
    ),
  );
  await mutation("video", { published: true }, video.id);
  assert.ok(
    (await (await request("/videos", { auth: false })).text()).includes(
      "[QA] Referral",
    ),
  );
  // Exercise real event recording; capture IDs for exact cleanup.
  const eventId = randomUUID();
  fixtures.events.push(eventId);
  let event = await request("/api/analytics", {
    method: "POST",
    auth: false,
    body: {
      id: eventId,
      path: "/videos?private=not-stored",
      referrer: "https://www.youtube.com/watch?v=private",
    },
    extra: {
      "User-Agent": "CreatorIntegrationTest/1.0",
      "X-Forwarded-For": "creator-qa",
    },
  });
  assert.equal(event.status, 204);
  browserCookie = event.headers
    .getSetCookie()
    .map((x) => x.split(";")[0])
    .join("; ");
  event = await request("/api/analytics", {
    method: "POST",
    auth: false,
    body: { id: eventId, path: "/videos", referrer: "" },
    extra: {
      Cookie: browserCookie,
      "User-Agent": "CreatorIntegrationTest/1.0",
      "X-Forwarded-For": "creator-qa",
    },
  });
  assert.equal(event.status, 204);
  const blocked = await request("/api/analytics", {
    method: "POST",
    auth: false,
    body: { id: randomUUID(), path: "/admin", referrer: "" },
  });
  assert.equal(blocked.status, 400);
  const go = await request(`/go/videoLink/${referral.id}`, {
    auth: false,
    extra: {
      Cookie: browserCookie,
      "User-Agent": "CreatorIntegrationTest/1.0",
      Referer: base + "/videos",
      "X-Forwarded-For": "creator-qa",
    },
  });
  assert.equal(go.status, 302);
  assert.equal(go.headers.get("location"), "https://example.com/?tag=qa");
  const after = await (await request("/api/admin/analytics?days=7")).json();
  assert.ok(after.views >= before.views + 1);
  assert.ok(after.referral_clicks >= before.referral_clicks + 1);
  assert.ok(after.pages.every((x) => !x.label.includes("?")));
  assert.ok(after.sources.some((x) => x.label === "www.youtube.com"));
  await request("/api/admin/content", {
    method: "DELETE",
    body: { kind: "pageLink", id: a.id },
  });
  assert.equal(
    (await request(`/go/pageLink/${a.id}`, { auth: false })).status,
    404,
  );
  await mutation("pageLink", { archived: false }, a.id);
  assert.equal(
    (
      await request(`/go/pageLink/${a.id}`, {
        auth: false,
        extra: { DNT: "1" },
      })
    ).status,
    302,
  );
  const csv = await request("/api/admin/leads?format=csv");
  assert.equal(csv.status, 200);
  assert.ok(csv.headers.get("content-disposition").includes("attachment"));
  // Mark content hidden before cleanup in case a later external call fails.
  await mutation("video", { published: false }, video.id);
  await mutation("page", { published: false }, page.id);
  console.log(
    "PASS: authentication, CSRF, content CRUD, URL validation, custom uppercase shortcuts, drafts, reorder/stale rejection, referrals, real analytics, deduplication, archive/restore, enquiry CSV.",
  );
} finally {
  // Click events have server-generated IDs. Match only the disposable target IDs.
  const token = managementToken();
  const targets = [
    ...fixtures.video,
    ...fixtures.videoLink,
    ...fixtures.pageLink,
  ];
  if (targets.length) {
    const response = await fetch(
      "https://api.supabase.com/v1/projects/evdmhxxoiwmlnzjgrkwo/database/query",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `select id from public.creator_analytics_events where target_id in (${targets.map((id) => `'${id}'::uuid`).join(",")})`,
          read_only: true,
        }),
      },
    );
    assert.ok(response.ok);
    for (const row of await response.json()) fixtures.events.push(row.id);
  }
  await cleanup();
  console.log(
    "Cleaned only this run’s disposable test records and tracking events.",
  );
}
