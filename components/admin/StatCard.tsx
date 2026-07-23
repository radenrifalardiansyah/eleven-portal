import type { LucideIcon } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: "blue" | "yellow";
}) {
  return (
    <TiltCard className="group rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="mt-1 font-heading text-3xl font-semibold text-ink-900">{value}</p>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            accent === "yellow" ? "bg-brand-yellow/15 text-brand-yellow" : "bg-brand-blue/10 text-brand-blue"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </TiltCard>
  );
}
