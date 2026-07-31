export type AnalyticsGranularity = "day" | "week" | "month" | "year";

export const GRANULARITY_TABS: { value: AnalyticsGranularity; label: string }[] = [
  { value: "day", label: "Harian" },
  { value: "week", label: "Mingguan" },
  { value: "month", label: "Bulanan" },
  { value: "year", label: "Tahunan" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Lookback window per granularity — 30 daily points, 12 weekly/monthly points,
 *  and "all time" for yearly (nothing meaningful to cap a year view at). */
export function getRangeSince(granularity: AnalyticsGranularity): string {
  const now = Date.now();
  switch (granularity) {
    case "day":
      return new Date(now - 30 * DAY_MS).toISOString();
    case "week":
      return new Date(now - 12 * 7 * DAY_MS).toISOString();
    case "month":
      return new Date(now - 365 * DAY_MS).toISOString();
    case "year":
      return new Date("2000-01-01T00:00:00Z").toISOString();
  }
}

export function formatBucketLabel(bucket: string, granularity: AnalyticsGranularity): string {
  const date = new Date(bucket);
  switch (granularity) {
    case "day":
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    case "week":
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    case "month":
      return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    case "year":
      return date.toLocaleDateString("id-ID", { year: "numeric" });
  }
}
