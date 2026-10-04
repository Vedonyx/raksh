create table public.creator_videos (
  id uuid primary key default gen_random_uuid(), title text not null check (char_length(title) between 1 and 160),
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'), description text not null default '' check (char_length(description) <= 1200),
  format text not null default 'long' check (format in ('short','long')), position integer not null default 0,
  published boolean not null default false, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.creator_link_pages (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,47}$'),
  title text not null check (char_length(title) between 1 and 160), description text not null default '' check (char_length(description) <= 1200),
  published boolean not null default false, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint reserved_creator_slug check (slug not in ('admin','api','about','work','consultations','for-brands','faq','contact','booking-policy','videos','go','_next'))
);
create table public.creator_video_links (
  id uuid primary key default gen_random_uuid(), parent_id uuid not null references public.creator_videos(id),
  label text not null check (char_length(label) between 1 and 160), url text not null check (char_length(url) between 1 and 2048),
  description text not null default '' check (char_length(description) <= 300), position integer not null default 0,
  published boolean not null default false, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.creator_page_links (like public.creator_video_links including defaults including constraints);
alter table public.creator_page_links add primary key (id);
alter table public.creator_page_links add foreign key (parent_id) references public.creator_link_pages(id);
create index creator_video_links_parent_idx on public.creator_video_links(parent_id, position);
create index creator_page_links_parent_idx on public.creator_page_links(parent_id, position);
create index creator_videos_order_idx on public.creator_videos(published, archived, position);

create table public.creator_analytics_events (
  id uuid primary key, occurred_at timestamptz not null default now(),
  event_type text not null check (event_type in ('page_view','outbound_click')),
  visitor_hash text not null check (char_length(visitor_hash)=64), session_hash text not null check (char_length(session_hash)=64),
  path text not null check (char_length(path) between 1 and 180), referrer_host text not null default '' check (char_length(referrer_host)<=253),
  device text not null check (device in ('mobile','tablet','desktop')),
  target_kind text check (target_kind in ('video','videoLink','pageLink')), target_id uuid,
  check ((event_type='page_view' and target_id is null and target_kind is null) or (event_type='outbound_click' and target_id is not null and target_kind is not null))
);
create index creator_events_time_idx on public.creator_analytics_events(occurred_at);
create index creator_events_target_idx on public.creator_analytics_events(target_kind, target_id, occurred_at) where target_id is not null;
create table public.creator_traffic_limits (client_key text primary key, window_started_at timestamptz not null default now(), attempts integer not null default 0);

alter table public.creator_videos enable row level security;
alter table public.creator_link_pages enable row level security;
alter table public.creator_video_links enable row level security;
alter table public.creator_page_links enable row level security;
alter table public.creator_analytics_events enable row level security;
alter table public.creator_traffic_limits enable row level security;
revoke all on public.creator_videos, public.creator_link_pages, public.creator_video_links, public.creator_page_links, public.creator_analytics_events, public.creator_traffic_limits from public, anon, authenticated;
grant select,insert,update on public.creator_videos, public.creator_link_pages, public.creator_video_links, public.creator_page_links to service_role;
grant select,insert,delete on public.creator_analytics_events to service_role;
grant select,insert,update,delete on public.creator_traffic_limits to service_role;

-- Reordering is transactional and rejects stale/incomplete lists.
create function public.reorder_creator_content(p_kind text, p_parent uuid, p_ids uuid[])
returns boolean language plpgsql security invoker set search_path='' as $$
declare tab text; total integer; found integer;
begin
  tab := case p_kind when 'video' then 'creator_videos' when 'videoLink' then 'creator_video_links' when 'pageLink' then 'creator_page_links' else null end;
  if tab is null or (p_kind <> 'video' and p_parent is null) or cardinality(p_ids)>1000 then raise exception 'Invalid order'; end if;
  perform pg_advisory_xact_lock(hashtextextended(tab || coalesce(p_parent::text,''),0));
  if p_kind='video' then
    select count(*) into total from public.creator_videos where not archived;
    select count(distinct id) into found from public.creator_videos where not archived and id=any(p_ids);
  else
    execute format('select count(*) from public.%I where not archived and parent_id=$1',tab) into total using p_parent;
    execute format('select count(distinct id) from public.%I where not archived and parent_id=$1 and id=any($2)',tab) into found using p_parent,p_ids;
  end if;
  if total <> cardinality(p_ids) or found <> total then raise exception 'List changed; refresh before reordering'; end if;
  execute format('update public.%I t set position=o.n::integer, updated_at=now() from unnest($1::uuid[]) with ordinality o(id,n) where t.id=o.id',tab) using p_ids;
  return true;
end $$;

create function public.record_creator_event(p_event jsonb, p_key text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare attempts_count integer;
begin
  if char_length(p_key)<>64 then return false; end if;
  insert into public.creator_traffic_limits(client_key,attempts) values(p_key,1)
  on conflict(client_key) do update set
    attempts=case when creator_traffic_limits.window_started_at < now()-interval '5 minutes' then 1 else creator_traffic_limits.attempts+1 end,
    window_started_at=case when creator_traffic_limits.window_started_at < now()-interval '5 minutes' then now() else creator_traffic_limits.window_started_at end
  returning attempts into attempts_count;
  if attempts_count > 180 then return false; end if;
  insert into public.creator_analytics_events(id,event_type,visitor_hash,session_hash,path,referrer_host,device,target_kind,target_id)
  values ((p_event->>'id')::uuid,p_event->>'event_type',p_event->>'visitor_hash',p_event->>'session_hash',p_event->>'path',p_event->>'referrer_host',p_event->>'device',p_event->>'target_kind',(p_event->>'target_id')::uuid)
  on conflict(id) do nothing;
  -- Bound retention without storing raw IP addresses or customer form content.
  if random()<0.01 then
    delete from public.creator_traffic_limits where window_started_at < now()-interval '1 day';
    delete from public.creator_analytics_events where occurred_at < now()-interval '180 days';
  end if;
  return true;
end $$;

create function public.creator_analytics_summary(p_days integer default 30)
returns jsonb language sql stable security invoker set search_path='' as $$
with bounds as (select greatest(1,least(90,p_days)) n, ((now() at time zone 'Asia/Kolkata')::date - (greatest(1,least(90,p_days))-1)) first_day),
events as (select e.*,(occurred_at at time zone 'Asia/Kolkata')::date as day_key from public.creator_analytics_events e,bounds b where occurred_at >= b.first_day::timestamp at time zone 'Asia/Kolkata' and occurred_at<=now()),
days as (select (b.first_day+i)::text as day_key from bounds b,generate_series(0,b.n-1) i),
daily as (select d.day_key as "day",count(e.id) filter(where e.event_type='page_view') views,count(e.id) filter(where e.event_type='outbound_click') clicks from days d left join events e on e.day_key::text=d.day_key group by d.day_key order by d.day_key),
pages as (select path label,count(*) count from events where event_type='page_view' group by path order by count(*) desc limit 8),
sources as (select coalesce(nullif(referrer_host,''),'Direct / internal') label,count(*) count from events where event_type='page_view' group by referrer_host order by count(*) desc limit 8),
devices as (select device label,count(*) count from events where event_type='page_view' group by device order by count(*) desc),
targets as (select target_kind kind,target_id id,count(*) count from events where event_type='outbound_click' group by target_kind,target_id order by count(*) desc)
select jsonb_build_object(
  'views',(select count(*) from events where event_type='page_view'),
  'visitors',(select count(distinct visitor_hash) from events where event_type='page_view'),
  'sessions',(select count(distinct session_hash) from events where event_type='page_view'),
  'clicks',(select count(*) from events where event_type='outbound_click'),
  'referral_clicks',(select count(*) from events where target_kind='videoLink'),
  'first_event',(select min(occurred_at) from public.creator_analytics_events),
  'daily',coalesce((select jsonb_agg(daily) from daily),'[]'::jsonb),
  'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),
  'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),
  'devices',coalesce((select jsonb_agg(devices) from devices),'[]'::jsonb),
  'targets',coalesce((select jsonb_agg(targets) from targets),'[]'::jsonb)
); $$;
revoke all on function public.reorder_creator_content(text,uuid,uuid[]), public.record_creator_event(jsonb,text), public.creator_analytics_summary(integer) from public,anon,authenticated;
grant execute on function public.reorder_creator_content(text,uuid,uuid[]), public.record_creator_event(jsonb,text), public.creator_analytics_summary(integer) to service_role;

insert into public.creator_videos(title,youtube_id,format,position,published) values
('Minecraft on a ₹400 laptop','aIoVDZAW85w','short',1,true),
('A dream, made real','JwkTl4vUG8w','short',2,true),
('Amazon''s cheapest phone','r-wAO7PDjJQ','short',3,true),
('Lava meets water','_PaNmz3GGR0','short',4,true),
('Underrated gaming cafes','MA57PwobhGE','short',5,true),
('The cheapest gaming PC','EsAf8BOaQ-k','short',6,true);
insert into public.creator_link_pages(slug,title,description,published) values
('links','Everything Rakshit.','Videos, creator consultations and the places you can find me.',true);
insert into public.creator_page_links(parent_id,label,url,position,published)
select p.id,l.label,l.url,l.position,true from public.creator_link_pages p cross join (values
('Videos & links','/videos',1),('Creator consultations','/consultations',2),('Brand collaborations','/for-brands',3),
('YouTube · Rakshit Jain','https://www.youtube.com/@RakshXD',4),('YouTube · Personal','https://www.youtube.com/@rakshit.jain1',5),
('Instagram · Rakshit Jain','https://www.instagram.com/rakshxdd/',6),('Instagram · Personal','https://www.instagram.com/rakshit.jain1/',7)
) l(label,url,position) where p.slug='links';
