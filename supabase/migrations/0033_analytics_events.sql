-- ============================================================
-- Portal analytics: page views + navbar menu clicks from the
-- public site, aggregated for the admin Dashboard page.
--
-- No PII (no IP/geo) is stored. `device_type`/`browser` are
-- classified once client-side at insert time (see
-- lib/analytics/device.ts) so dashboard aggregation never needs
-- to re-parse user_agent. `session_id` is a client-generated
-- UUID persisted in localStorage, used only to count unique
-- visitors (count distinct), not to identify anyone.
-- ============================================================

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('pageview', 'menu_click')),
  path text not null,
  label text,
  href text,
  referrer text,
  device_type text not null check (device_type in ('desktop', 'mobile', 'tablet')),
  browser text,
  session_id text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index analytics_events_created_at_idx on analytics_events (created_at desc);
create index analytics_events_type_created_at_idx on analytics_events (event_type, created_at desc);
create index analytics_events_path_idx on analytics_events (path);
create index analytics_events_session_id_idx on analytics_events (session_id);

alter table analytics_events enable row level security;

-- Public write-only: any visitor (anon) or logged-in staff can log an
-- event, but nobody can read/update/delete except staff (below).
create policy "analytics_events_insert_public"
  on analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "analytics_events_select_staff"
  on analytics_events for select
  to authenticated
  using (public.current_role() is not null);

-- ------------------------------------------------------------
-- Aggregation RPCs. Default SECURITY INVOKER, so they run as the
-- calling user and stay subject to the select policy above.
-- ------------------------------------------------------------

create function public.analytics_kpis(p_since timestamptz)
returns table (total_pageviews bigint, unique_visitors bigint, total_menu_clicks bigint)
language sql
stable
as $$
  select
    count(*) filter (where event_type = 'pageview'),
    count(distinct session_id) filter (where event_type = 'pageview'),
    count(*) filter (where event_type = 'menu_click')
  from analytics_events
  where created_at >= p_since;
$$;

create function public.analytics_timeseries(p_granularity text, p_since timestamptz)
returns table (bucket timestamptz, pageviews bigint, unique_visitors bigint)
language sql
stable
as $$
  select
    date_trunc(p_granularity, created_at) as bucket,
    count(*) filter (where event_type = 'pageview'),
    count(distinct session_id) filter (where event_type = 'pageview')
  from analytics_events
  where created_at >= p_since
    and p_granularity in ('day', 'week', 'month', 'year')
  group by bucket
  order by bucket;
$$;

create function public.analytics_device_breakdown(p_since timestamptz)
returns table (device_type text, total bigint)
language sql
stable
as $$
  select device_type, count(*)
  from analytics_events
  where created_at >= p_since and event_type = 'pageview'
  group by device_type
  order by 2 desc;
$$;

create function public.analytics_browser_breakdown(p_since timestamptz)
returns table (browser text, total bigint)
language sql
stable
as $$
  select coalesce(browser, 'Lainnya'), count(*)
  from analytics_events
  where created_at >= p_since and event_type = 'pageview'
  group by 1
  order by 2 desc;
$$;

create function public.analytics_top_pages(p_since timestamptz, p_limit int)
returns table (path text, total bigint)
language sql
stable
as $$
  select path, count(*)
  from analytics_events
  where created_at >= p_since and event_type = 'pageview'
  group by path
  order by 2 desc
  limit p_limit;
$$;

create function public.analytics_top_menu_clicks(p_since timestamptz, p_limit int)
returns table (label text, total bigint)
language sql
stable
as $$
  select label, count(*)
  from analytics_events
  where created_at >= p_since and event_type = 'menu_click' and label is not null
  group by label
  order by 2 desc
  limit p_limit;
$$;

create function public.analytics_top_referrers(p_since timestamptz, p_limit int)
returns table (referrer_host text, total bigint)
language sql
stable
as $$
  select regexp_replace(referrer, '^https?://([^/]+).*$', '\1'), count(*)
  from analytics_events
  where created_at >= p_since
    and event_type = 'pageview'
    and referrer is not null
    and referrer <> ''
  group by 1
  order by 2 desc
  limit p_limit;
$$;

grant execute on function public.analytics_kpis(timestamptz) to authenticated;
grant execute on function public.analytics_timeseries(text, timestamptz) to authenticated;
grant execute on function public.analytics_device_breakdown(timestamptz) to authenticated;
grant execute on function public.analytics_browser_breakdown(timestamptz) to authenticated;
grant execute on function public.analytics_top_pages(timestamptz, int) to authenticated;
grant execute on function public.analytics_top_menu_clicks(timestamptz, int) to authenticated;
grant execute on function public.analytics_top_referrers(timestamptz, int) to authenticated;
