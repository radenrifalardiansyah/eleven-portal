"use client";

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SERIES_PAGEVIEWS, SERIES_VISITORS, CHART_INK } from "@/lib/analytics/chart-colors";
import { formatBucketLabel, type AnalyticsGranularity } from "@/lib/analytics/ranges";

type TimeseriesPoint = { bucket: string; pageviews: number; unique_visitors: number };

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-ink-900/5 bg-white p-3 text-sm shadow-md">
      <p className="mb-1.5 font-medium text-ink-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-ink-700">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-ink-500">{entry.name}</span>
          <span className="tabular-nums font-medium">{entry.value.toLocaleString("id-ID")}</span>
        </div>
      ))}
    </div>
  );
}

export default function TimeseriesChart({
  data,
  granularity,
  periodDeltaPct,
}: {
  data: TimeseriesPoint[];
  granularity: AnalyticsGranularity;
  /** % change vs the immediately preceding period of equal length. `null`/omit hides the badge
   *  (e.g. no meaningful "previous period" for the all-time "Tahunan" view). */
  periodDeltaPct?: number | null;
}) {
  const chartData = data.map((point) => ({
    label: formatBucketLabel(point.bucket, granularity),
    Kunjungan: point.pageviews,
    "Pengunjung Unik": point.unique_visitors,
  }));

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-ink-900">Tren Kunjungan Portal</p>
          {periodDeltaPct != null && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                periodDeltaPct >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              {periodDeltaPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {periodDeltaPct >= 0 ? "+" : ""}
              {periodDeltaPct}% dibanding periode sebelumnya
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_PAGEVIEWS }} />
            Kunjungan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_VISITORS }} />
            Pengunjung Unik
          </span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-500">Belum ada data untuk rentang ini.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="kunjunganFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES_PAGEVIEWS} stopOpacity={0.12} />
                <stop offset="100%" stopColor={SERIES_PAGEVIEWS} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART_INK.gridline} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_INK.secondary, fontSize: 12 }}
              axisLine={{ stroke: CHART_INK.gridline }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: CHART_INK.secondary, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Kunjungan"
              stroke={SERIES_PAGEVIEWS}
              strokeWidth={2}
              fill="url(#kunjunganFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="Pengunjung Unik"
              stroke={SERIES_VISITORS}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
