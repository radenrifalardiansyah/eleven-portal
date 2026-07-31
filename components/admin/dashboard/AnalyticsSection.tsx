"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Eye, Users, MousePointerClick } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import TimeseriesChart from "@/components/admin/dashboard/TimeseriesChart";
import RankedBarList from "@/components/admin/dashboard/RankedBarList";
import { getPortalAnalytics, type PortalAnalytics } from "@/app/admin/(dashboard)/actions";
import { GRANULARITY_TABS, type AnalyticsGranularity } from "@/lib/analytics/ranges";
import { DEVICE_COLORS, DEVICE_LABELS, browserColor } from "@/lib/analytics/chart-colors";

export default function AnalyticsSection({
  initialGranularity,
  initialData,
}: {
  initialGranularity: AnalyticsGranularity;
  initialData: PortalAnalytics;
}) {
  const [granularity, setGranularity] = useState(initialGranularity);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function handleTabChange(next: AnalyticsGranularity) {
    setGranularity(next);
    startTransition(async () => {
      const result = await getPortalAnalytics(next);
      setData(result);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-ink-900">Analitik Portal</h2>
        <div className="flex gap-1 rounded-full border border-ink-900/5 bg-white p-1 shadow-sm">
          {GRANULARITY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                granularity === tab.value
                  ? "bg-brand-blue text-white"
                  : "text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={clsx("space-y-6 transition-opacity", isPending && "opacity-60")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Kunjungan" value={data.kpis.total_pageviews} icon={Eye} />
          <StatCard label="Pengunjung Unik" value={data.kpis.unique_visitors} icon={Users} accent="yellow" />
          <StatCard label="Klik Menu" value={data.kpis.total_menu_clicks} icon={MousePointerClick} />
        </div>

        <TimeseriesChart data={data.timeseries} granularity={granularity} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RankedBarList
            title="Perangkat"
            items={data.deviceBreakdown.map((row) => ({
              key: row.device_type,
              label: DEVICE_LABELS[row.device_type] ?? row.device_type,
              value: row.total,
            }))}
            colorFor={(key) => DEVICE_COLORS[key] ?? "#8B8D93"}
            showPercentOfTotal
          />
          <RankedBarList
            title="Browser"
            items={data.browserBreakdown.map((row) => ({ key: row.browser, label: row.browser, value: row.total }))}
            colorFor={browserColor}
            showPercentOfTotal
          />
          <RankedBarList
            title="Halaman Paling Banyak Dikunjungi"
            items={data.topPages.map((row) => ({ key: row.path, label: row.path, value: row.total }))}
            colorFor={() => "#2a78d6"}
          />
          <RankedBarList
            title="Menu Paling Banyak Diklik"
            items={data.topMenuClicks.map((row) => ({ key: row.label, label: row.label, value: row.total }))}
            colorFor={() => "#2a78d6"}
          />
          <RankedBarList
            title="Sumber Trafik (Referrer)"
            items={data.topReferrers.map((row) => ({
              key: row.referrer_host,
              label: row.referrer_host,
              value: row.total,
            }))}
            colorFor={() => "#2a78d6"}
          />
        </div>
      </div>
    </div>
  );
}
