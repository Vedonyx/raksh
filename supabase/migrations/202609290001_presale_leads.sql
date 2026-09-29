create table if not exists public.presale_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  whatsapp text check (char_length(whatsapp) <= 35),
  module text not null check (module in ('01', '02', '03')),
  preferred_date date,
  preferred_time time,
  goal text check (char_length(goal) <= 2000),
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  admin_note text check (char_length(admin_note) <= 2000),
  constraint preferred_time_pair check ((preferred_date is null) = (preferred_time is null))
);

create index if not exists presale_leads_created_at_idx on public.presale_leads (created_at desc);
create index if not exists presale_leads_status_idx on public.presale_leads (status, created_at desc);
alter table public.presale_leads enable row level security;
revoke all on public.presale_leads from anon, authenticated;
grant select, insert, update on public.presale_leads to service_role;

create table if not exists public.admin_login_limits (
  client_key text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.admin_login_limits enable row level security;
revoke all on public.admin_login_limits from anon, authenticated;

create or replace function public.allow_admin_login(p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare current_attempts integer;
begin
  insert into public.admin_login_limits (client_key, window_started_at, attempts)
  values (p_key, now(), 1)
  on conflict (client_key) do update
  set window_started_at = case when now() - admin_login_limits.window_started_at > interval '15 minutes' then now() else admin_login_limits.window_started_at end,
      attempts = case when now() - admin_login_limits.window_started_at > interval '15 minutes' then 1 else admin_login_limits.attempts + 1 end
  returning attempts into current_attempts;
  return current_attempts <= 5;
end;
$$;
revoke all on function public.allow_admin_login(text) from public, anon, authenticated;
grant execute on function public.allow_admin_login(text) to service_role;
