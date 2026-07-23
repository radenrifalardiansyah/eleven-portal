import type { ContentStatus } from "@/lib/supabase/types";

const CONFIG: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-ink-900/10 text-ink-500" },
  pending: { label: "Pending Review", className: "bg-brand-yellow/20 text-[#8a6d00]" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  const { label, className } = CONFIG[status];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}
