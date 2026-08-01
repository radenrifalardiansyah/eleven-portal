import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  subtitle,
  trend,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: "blue" | "yellow";
  /** Small caption under the value, e.g. "Akumulasi sejak 1 Jul 2026". */
  subtitle?: string;
  /** `pct: null` renders a neutral "Baru" badge (no baseline to compare against). */
  trend?: { pct: number | null; label: string };
}) {
  return (
    <TiltCard className="group rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="mt-1 font-heading text-3xl font-semibold text-ink-900">
            {value.toLocaleString("id-ID")}
          </p>
          {subtitle && <p className="mt-1 text-xs text-ink-500">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                trend.pct === null ? "text-ink-500" : trend.pct >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.pct !== null &&
                (trend.pct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />)}
              {trend.pct === null ? "Baru" : `${trend.pct >= 0 ? "+" : ""}${trend.pct}%`} {trend.label}
            </p>
          )}
        </div>
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            accent === "yellow" ? "bg-brand-yellow/15 text-brand-yellow" : "bg-brand-blue/10 text-brand-blue"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </TiltCard>
  );
}
