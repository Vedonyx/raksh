# Pre-sales backend

The consultation form posts to `/api/leads`. This server route writes to `public.presale_leads` in Supabase. `/admin` uses an HTTP-only, signed, eight-hour cookie; admin routes verify it before reading or updating leads. The browser never receives the Supabase secret key. Payment is not connected.

## Required environment variables

Copy `.env.example` to `.env.local` for local development. Set the same values in the hosting provider's server environment before deploying. Do not use a `NEXT_PUBLIC_` prefix for secrets.

- `SUPABASE_URL`: project API URL.
- `SUPABASE_SECRET_KEY`: server-side `sb_secret_...` key from the project's API Keys page. The `sbp_...` personal access token is a management credential and must not be used here.
- `ADMIN_EMAIL`: login email.
- `ADMIN_PASSWORD_HASH`: scrypt salt and 64-byte hash, joined by `:`. Generate with `node scripts/hash-admin-password.mjs` and enter the password at its prompt.
- `ADMIN_SESSION_SECRET`: independent random string of at least 32 characters. Generate with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.

Apply `supabase/migrations/202609290001_presale_leads.sql` to the intended project. Row level security is enabled and anonymous/authenticated roles have no table privileges; only the server's secret key can access the table.

Before launch, submit one synthetic lead through the form, confirm it appears in `/admin`, update its status, export the CSV, and remove the synthetic row in Supabase. Rotate any password shared in chat after first use.
