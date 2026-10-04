# Creator workspace and pre-sales backend

The consultation form posts to `/api/leads`. This server route writes to `public.presale_leads` in Supabase. `/admin` uses an HTTP-only, signed, eight-hour cookie; admin routes verify it before reading or updating leads. The browser never receives the Supabase secret key. Payment is not connected.

## Required environment variables

Copy `.env.example` to `.env.local` for local development. Set the same values in the hosting provider's server environment before deploying. Do not use a `NEXT_PUBLIC_` prefix for secrets.

- `SUPABASE_URL`: project API URL.
- `SUPABASE_SECRET_KEY`: server-side `sb_secret_...` key from the project's API Keys page. The `sbp_...` personal access token is a management credential and must not be used here.
- `ADMIN_EMAIL`: login email.
- `ADMIN_PASSWORD_HASH`: scrypt salt and 64-byte hash, joined by `:`. Generate with `node scripts/hash-admin-password.mjs` and enter the password at its prompt.
- `ADMIN_SESSION_SECRET`: independent random string of at least 32 characters. Generate with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.

Apply the files in `supabase/migrations` in order to the intended project. Row level security is enabled and anonymous/authenticated roles have no table privileges; only the server's secret key can access the table. The second migration makes the admin rate-limit function run with the server role's privileges.

Before launch, submit one synthetic lead through the form, confirm it appears in `/admin`, update its status, export the CSV, and remove the synthetic row in Supabase. Rotate any password shared in chat after first use.

## Creator content

`/admin` has Overview, Enquiries, Videos & referrals, and Link pages. Existing credentials are unchanged. The new features use the same five server environment variables above; no new production secret is required.

- **Videos:** add a YouTube watch/Short/share URL, title, format and description. Each video can have multiple named referral URLs. Draft videos and links are hidden. Move videos and referral buttons up/down to change priority. Published videos appear at `/videos`.
- **Link pages:** edit the existing `/links` page or create a custom shortcut such as `srts`. It appears at `/srts` (uppercase `/SRTS` also resolves). Add named links and change their priority with up/down buttons. Existing website routes are reserved. Each page has its own draft/published state.
- **Archive:** hides an item without deleting it. Restore it from Archived. Archiving a parent hides all its links, including direct tracked URLs. The main `/links` page cannot be archived or renamed.
- Public destinations accept HTTPS URLs or public relative website paths. YouTube IDs and custom shortcuts are validated. All writes require a signed admin cookie and a same-origin request. Reordering happens in one database transaction and rejects stale/incomplete lists.

Apply the October migrations to the same Supabase project before deploying this release. All creator tables have RLS enabled, no anonymous/authenticated table grants, and server-only access. The three RPC functions use security invoker and are executable only by service_role. Supabase's informational “RLS Enabled No Policy” notice is expected for these server-only tables.

## Website analytics

The first-party tracker records public page views and clicks on managed video/referral/page links. Overview supports 7/30/90 days, daily traffic, unique cookie-based visitors, sessions, referral clicks, top pages, referrer hosts, devices and enquiry counts. Each managed link shows its click count in the selected period. Enquiries remain available in full, including older records.

- Traffic starts with the first tracked visit; earlier traffic is not reconstructed. These are website metrics, not live YouTube/Instagram analytics, payments or revenue.
- The server stores hashed visitor/session identifiers and the path without its query string. It stores the referrer hostname, not its full URL. Raw IP addresses, enquiry content and admin browsing are not stored as traffic events.
- Visitor cookies last 30 days; session cookies expire after 30 minutes of inactivity. Both are HTTP-only and signed. Privacy signals (DNT/GPC), obvious bots, prefetches and HEAD requests are excluded. Unique visitor counts are consequently approximate and may differ from hosting analytics.
- Tracking endpoints have a database rate limit and UUID event deduplication. Events are retained for up to 180 days, with expired data removed opportunistically during normal traffic. Redirects still work when tracking is temporarily unavailable.

## Verification

Run `npm run lint` and `npm run build`. The integration check is `node scripts/test-creator-workspace.mjs` against a running local website. It reads ignored `.env.local`, and requires a management token solely to remove its own disposable test records: set `SUPABASE_ACCESS_TOKEN`, or `TEST_SUPABASE_MANAGEMENT_ENV` to the absolute path of an ignored env file containing it. Never commit that credential or set it as NEXT_PUBLIC. The script never prints keys or real enquiries.

Original analytics screenshots remain unchanged. `node scripts/build-proof-crops.mjs` creates SVG viewBox crops that show only the relevant source pixels, with no re-created numbers. Homepage, Work and avatar proof images use these clean crops.
