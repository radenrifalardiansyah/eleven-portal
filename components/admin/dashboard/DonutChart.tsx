"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type DonutItem = { key: string; label: string; value: number };

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="rounded-xl border border-ink-900/5 bg-white p-3 text-sm shadow-md">
      <div className="flex items-center gap-2 text-ink-700">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <span className="text-ink-500">{entry.name}</span>
        <span className="tabular-nums font-medium">{entry.value.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}

const FALLBACK_COLOR = "#8B8D93";

export default function DonutChart({
  title,
  items,
  colors,
  centerLabel,
}: {
  title: string;
  items: DonutItem[];
  colors: Record<string, string>;
  centerLabel: string;
}) {
  const colorFor = (key: string) => colors[key] ?? FALLBACK_COLOR;
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const data = items.map((item) => ({ name: item.label, value: item.value, color: colorFor(item.key) }));

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-ink-900">{title}</p>

      {total === 0 ? (
        <p className="mt-4 text-sm text-ink-500">Belum ada data.</p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-heading text-2xl font-semibold text-ink-900">
                  {total.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-ink-500">{centerLabel}</p>
              </div>
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-2.5">
            {items.map((item) => {
              const percentOfTotal = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 truncate text-ink-700" title={item.label}>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: colorFor(item.key) }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-500">
                    {item.value.toLocaleString("id-ID")} · {percentOfTotal}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
