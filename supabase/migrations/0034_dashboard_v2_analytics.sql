-- ============================================================
-- Dashboard v2: hero KPIs, real menu-section distribution,
-- period-over-period comparison, and top-content (case study /
-- stories) analytics RPCs for the redesigned admin Dashboard.
--
-- "Today"/"yesterday" are computed in Asia/Jakarta wall-clock
-- time explicitly (not the database session timezone) — unlike
-- analytics_timeseries's plain date_trunc(), which implicitly
-- relies on the session tz and was never user-facing as a
-- literal "today" claim until now.
-- ============================================================

create function public.analytics_overview_kpi()
returns table (
  total_pageviews_all_time bigint,
  today_pageviews bigint,
  yesterday_pageviews bigint,
  tracking_since timestamptz
)
language sql
stable
as $$
  with bounds as (
    select
      (date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta') as today_start,
      ((date_trunc('day', now() at time zone 'Asia/Jakarta') - interval '1 day') at time zone 'Asia/Jakarta') as yesterday_start
  )
  select
    (select count(*) from analytics_events where event_type = 'pageview'),
    (select count(*) from analytics_events, bounds
       where event_type = 'pageview' and created_at >= bounds.today_start),
    (select count(*) from analytics_events, bounds
       where event_type = 'pageview'
         and created_at >= bounds.yesterday_start
         and created_at < bounds.today_start),
    (select min(created_at) from analytics_events);
$$;

-- Buckets every pageview into the site's real top-level sections
-- (not just the top-N distinct paths like analytics_top_pages,
-- which would undercount sections whose traffic is spread across
-- many distinct URLs).
create function public.analytics_section_breakdown(p_since timestamptz)
returns table (section text, total bigint)
language sql
stable
as $$
  select
    case
      when path = '/' then 'home'
      when path like '/products%' then 'products'
      when path like '/services%' then 'services'
      when path like '/case-study%' then 'case_study'
      when path like '/stories%' then 'stories'
      when path like '/team%' then 'team'
      else 'other'
    end as section,
    count(*)
  from analytics_events
  where created_at >= p_since and event_type = 'pageview'
  group by 1
  order by 2 desc;
$$;

-- Compares the current window (p_since..now) against the
-- immediately preceding window of the same duration.
create function public.analytics_period_comparison(p_since timestamptz)
returns table (current_total bigint, previous_total bigint)
language sql
stable
as $$
  with bounds as (
    select p_since as cur_start, now() as cur_end
  ), prev as (
    select
      cur_start - (cur_end - cur_start) as prev_start,
      cur_start as prev_end
    from bounds
  )
  select
    (select count(*) from analytics_events, bounds
       where event_type = 'pageview'
         and created_at >= bounds.cur_start and created_at < bounds.cur_end),
    (select count(*) from analytics_events, prev
       where event_type = 'pageview'
         and created_at >= prev.prev_start and created_at < prev.prev_end);
$$;

-- Top pages under a given prefix (e.g. Portfolio Terpopuler / Berita
-- Terpopuler). Contract: call with a TRAILING SLASH, e.g.
-- '/case-study/', '/stories/' — the trailing slash is what excludes
-- the listing page itself from the `like` match; `path <> p_path_prefix`
-- is a redundant belt-and-suspenders guard, not the primary exclusion.
create function public.analytics_top_content(p_path_prefix text, p_since timestamptz, p_limit int)
returns table (path text, total bigint)
language sql
stable
as $$
  select path, count(*)
  from analytics_events
  where created_at >= p_since
    and event_type = 'pageview'
    and path like p_path_prefix || '%'
    and path <> p_path_prefix
  group by path
  order by 2 desc
  limit p_limit;
$$;

grant execute on function public.analytics_overview_kpi() to authenticated;
grant execute on function public.analytics_section_breakdown(timestamptz) to authenticated;
grant execute on function public.analytics_period_comparison(timestamptz) to authenticated;
grant execute on function public.analytics_top_content(text, timestamptz, int) to authenticated;
