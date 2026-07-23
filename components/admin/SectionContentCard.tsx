"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";
import { updatePageSectionContent } from "@/app/admin/(dashboard)/page-sections/actions";

export type SectionField = {
  key: string;
  label: string;
  type?: "text" | "textarea";
};

export default function SectionContentCard({
  pageKey,
  sectionKey,
  title,
  description,
  fields,
  initialContent,
  canEdit,
}: {
  pageKey: string;
  sectionKey: string;
  title: string;
  description: string;
  fields: SectionField[];
  initialContent: Record<string, string>;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(initialContent);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updatePageSectionContent(pageKey, sectionKey, values);
      toast.success("Konten section berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan konten section");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="font-heading text-sm font-semibold text-ink-900">{title}</p>
          <p className="mt-0.5 text-xs text-ink-500">{description}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-ink-900/5 p-5">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-medium text-ink-700">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  disabled={!canEdit}
                  rows={3}
                  className="w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-ink-900/[0.03] disabled:text-ink-500"
                />
              ) : (
                <input
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-ink-900/[0.03] disabled:text-ink-500"
                />
              )}
            </div>
          ))}

          {canEdit && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
