"use server";

import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getRangeSince, type AnalyticsGranularity } from "@/lib/analytics/ranges";

const TOP_LIST_LIMIT = 8;

export type PortalAnalytics = {
  kpis: { total_pageviews: number; unique_visitors: number; total_menu_clicks: number };
  timeseries: { bucket: string; pageviews: number; unique_visitors: number }[];
  deviceBreakdown: { device_type: string; total: number }[];
  browserBreakdown: { browser: string; total: number }[];
  topPages: { path: string; total: number }[];
  topMenuClicks: { label: string; total: number }[];
  topReferrers: { referrer_host: string; total: number }[];
};

export async function getPortalAnalytics(granularity: AnalyticsGranularity): Promise<PortalAnalytics> {
  await requireModule("dashboard", "view");

  const since = getRangeSince(granularity);
  const supabase = await createClient();

  const [kpis, timeseries, deviceBreakdown, browserBreakdown, topPages, topMenuClicks, topReferrers] =
    await Promise.all([
      supabase.rpc("analytics_kpis", { p_since: since }),
      supabase.rpc("analytics_timeseries", { p_granularity: granularity, p_since: since }),
      supabase.rpc("analytics_device_breakdown", { p_since: since }),
      supabase.rpc("analytics_browser_breakdown", { p_since: since }),
      supabase.rpc("analytics_top_pages", { p_since: since, p_limit: TOP_LIST_LIMIT }),
      supabase.rpc("analytics_top_menu_clicks", { p_since: since, p_limit: TOP_LIST_LIMIT }),
      supabase.rpc("analytics_top_referrers", { p_since: since, p_limit: TOP_LIST_LIMIT }),
    ]);

  for (const result of [kpis, timeseries, deviceBreakdown, browserBreakdown, topPages, topMenuClicks, topReferrers]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    kpis: kpis.data?.[0] ?? { total_pageviews: 0, unique_visitors: 0, total_menu_clicks: 0 },
    timeseries: timeseries.data ?? [],
    deviceBreakdown: deviceBreakdown.data ?? [],
    browserBreakdown: browserBreakdown.data ?? [],
    topPages: topPages.data ?? [],
    topMenuClicks: topMenuClicks.data ?? [],
    topReferrers: topReferrers.data ?? [],
  };
}
