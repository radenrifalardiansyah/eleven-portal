type RankedBarItem = {
  key: string;
  label: string;
  value: number;
};

export default function RankedBarList({
  title,
  items,
  colorFor,
  showPercentOfTotal = false,
}: {
  title: string;
  items: RankedBarItem[];
  colorFor: (key: string) => string;
  showPercentOfTotal?: boolean;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-ink-900">{title}</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">Belum ada data.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const color = colorFor(item.key);
            const widthPct = Math.max(4, (item.value / max) * 100);
            const percentOfTotal = total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <li key={item.key}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink-700" title={item.label}>
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-500">
                    {item.value.toLocaleString("id-ID")}
                    {showPercentOfTotal ? ` · ${percentOfTotal}%` : ""}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-900/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${widthPct}%`, backgroundColor: color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
