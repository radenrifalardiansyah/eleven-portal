"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
}: {
  data: TimeseriesPoint[];
  granularity: AnalyticsGranularity;
}) {
  const chartData = data.map((point) => ({
    label: formatBucketLabel(point.bucket, granularity),
    Kunjungan: point.pageviews,
    "Pengunjung Unik": point.unique_visitors,
  }));

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-900">Tren Kunjungan Portal</p>
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
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
            <Line
              type="monotone"
              dataKey="Kunjungan"
              stroke={SERIES_PAGEVIEWS}
              strokeWidth={2}
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
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
