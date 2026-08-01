"use server";

import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRangeSince, type AnalyticsGranularity } from "@/lib/analytics/ranges";

const TOP_LIST_LIMIT = 8;
const TOP_CONTENT_LIMIT = 5;

export type PortalAnalytics = {
  kpis: { total_pageviews: number; unique_visitors: number; total_menu_clicks: number };
  timeseries: { bucket: string; pageviews: number; unique_visitors: number }[];
  deviceBreakdown: { device_type: string; total: number }[];
  browserBreakdown: { browser: string; total: number }[];
  topPages: { path: string; total: number }[];
  topMenuClicks: { label: string; total: number }[];
  topReferrers: { referrer_host: string; total: number }[];
  sectionBreakdown: { section: string; total: number }[];
  periodComparison: { currentTotal: number; previousTotal: number; deltaPct: number | null };
  topCaseStudies: { title: string; total: number }[];
  topStories: { title: string; total: number }[];
};

export type OverviewKpi = {
  totalPageviewsAllTime: number;
  todayPageviews: number;
  yesterdayPageviews: number;
  trendPct: number | null;
  trackingSince: string | null;
};

export async function getOverviewKpi(): Promise<OverviewKpi> {
  await requireModule("dashboard", "view");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_overview_kpi");
  if (error) throw new Error(error.message);

  const row = data?.[0] ?? {
    total_pageviews_all_time: 0,
    today_pageviews: 0,
    yesterday_pageviews: 0,
    tracking_since: null,
  };

  return {
    totalPageviewsAllTime: row.total_pageviews_all_time,
    todayPageviews: row.today_pageviews,
    yesterdayPageviews: row.yesterday_pageviews,
    trendPct:
      row.yesterday_pageviews === 0
        ? null
        : Math.round(((row.today_pageviews - row.yesterday_pageviews) / row.yesterday_pageviews) * 100),
    trackingSince: row.tracking_since,
  };
}

/** Batch-joins path → real content title via the service-role client, bypassing RLS.
 *  `projects`/`stories` SELECT is gated by a different module permission
 *  (`projects`/`stories` "view") than `dashboard`, so a staff member with dashboard
 *  access but not that permission would otherwise silently get an empty join. The
 *  titles are already public (rendered on the live portal pages), so this narrow
 *  read-only lookup doesn't expose anything a visitor couldn't already see. */
async function joinTopContentTitles(
  rows: { path: string; total: number }[],
  prefix: string,
  table: "projects" | "stories"
): Promise<{ title: string; total: number }[]> {
  if (rows.length === 0) return [];

  const slugs = rows.map((row) => row.path.slice(prefix.length));
  const admin = createAdminClient();
  const { data } = await admin.from(table).select("slug, title").in("slug", slugs);
  const titleBySlug = new Map((data ?? []).map((row) => [row.slug, row.title]));

  return rows.map((row) => {
    const slug = row.path.slice(prefix.length);
    return { title: titleBySlug.get(slug) ?? row.path, total: row.total };
  });
}

export async function getPortalAnalytics(granularity: AnalyticsGranularity): Promise<PortalAnalytics> {
  await requireModule("dashboard", "view");

  const since = getRangeSince(granularity);
  const supabase = await createClient();

  const [
    kpis,
    timeseries,
    deviceBreakdown,
    browserBreakdown,
    topPages,
    topMenuClicks,
    topReferrers,
    sectionBreakdown,
    periodComparison,
    topCaseStudiesRaw,
    topStoriesRaw,
  ] = await Promise.all([
    supabase.rpc("analytics_kpis", { p_since: since }),
    supabase.rpc("analytics_timeseries", { p_granularity: granularity, p_since: since }),
    supabase.rpc("analytics_device_breakdown", { p_since: since }),
    supabase.rpc("analytics_browser_breakdown", { p_since: since }),
    supabase.rpc("analytics_top_pages", { p_since: since, p_limit: TOP_LIST_LIMIT }),
    supabase.rpc("analytics_top_menu_clicks", { p_since: since, p_limit: TOP_LIST_LIMIT }),
    supabase.rpc("analytics_top_referrers", { p_since: since, p_limit: TOP_LIST_LIMIT }),
    supabase.rpc("analytics_section_breakdown", { p_since: since }),
    supabase.rpc("analytics_period_comparison", { p_since: since }),
    supabase.rpc("analytics_top_content", { p_path_prefix: "/case-study/", p_since: since, p_limit: TOP_CONTENT_LIMIT }),
    supabase.rpc("analytics_top_content", { p_path_prefix: "/stories/", p_since: since, p_limit: TOP_CONTENT_LIMIT }),
  ]);

  for (const result of [
    kpis,
    timeseries,
    deviceBreakdown,
    browserBreakdown,
    topPages,
    topMenuClicks,
    topReferrers,
    sectionBreakdown,
    periodComparison,
    topCaseStudiesRaw,
    topStoriesRaw,
  ]) {
    if (result.error) throw new Error(result.error.message);
  }

  const [topCaseStudies, topStories] = await Promise.all([
    joinTopContentTitles(topCaseStudiesRaw.data ?? [], "/case-study/", "projects"),
    joinTopContentTitles(topStoriesRaw.data ?? [], "/stories/", "stories"),
  ]);

  const periodRow = periodComparison.data?.[0] ?? { current_total: 0, previous_total: 0 };
  // "Previous period" is meaningless for the all-time "Tahunan" window.
  const deltaPct =
    granularity === "year" || periodRow.previous_total === 0
      ? null
      : Math.round(((periodRow.current_total - periodRow.previous_total) / periodRow.previous_total) * 100);

  return {
    kpis: kpis.data?.[0] ?? { total_pageviews: 0, unique_visitors: 0, total_menu_clicks: 0 },
    timeseries: timeseries.data ?? [],
    deviceBreakdown: deviceBreakdown.data ?? [],
    browserBreakdown: browserBreakdown.data ?? [],
    topPages: topPages.data ?? [],
    topMenuClicks: topMenuClicks.data ?? [],
    topReferrers: topReferrers.data ?? [],
    sectionBreakdown: sectionBreakdown.data ?? [],
    periodComparison: {
      currentTotal: periodRow.current_total,
      previousTotal: periodRow.previous_total,
      deltaPct,
    },
    topCaseStudies,
    topStories,
  };
}
