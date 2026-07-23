import { Sparkles } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-900/10 bg-white/60 p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold text-ink-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        Modul CRUD untuk {title.toLowerCase()} akan hadir di Fase 2 pengembangan Content Studio.
      </p>
    </div>
  );
}
