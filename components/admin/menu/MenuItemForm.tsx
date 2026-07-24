"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createMenuItem, updateMenuItem, type MenuItemInput } from "@/app/admin/(dashboard)/menu-struktur/actions";
import IconPicker from "@/components/admin/IconPicker";
import SearchableSelect from "@/components/admin/SearchableSelect";
import type { MenuGroupRow, MenuItemRow } from "@/lib/cms/menu";
import type { ModuleRow } from "@/lib/cms/modules";

const schema = z.object({
  label: z.string().min(1, "Label wajib diisi"),
  href: z.string().min(1, "Href wajib diisi").refine((v) => v.startsWith("/") || v.startsWith("http"), {
    message: "Href harus path (/admin/...) atau URL eksternal (https://...)",
  }),
  icon: z.string().min(1),
  group_id: z.string().min(1, "Modul wajib dipilih"),
  parent_id: z.string(),
  module_key: z.string().min(1, "Kunci hak akses wajib dipilih"),
  always_visible: z.boolean(),
  show_bottom_nav: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function MenuItemForm({
  itemId,
  defaultValues,
  groups,
  parentOptions,
  modules,
  onSuccess,
  onCancel,
}: {
  itemId?: string;
  defaultValues?: Partial<FormValues>;
  groups: MenuGroupRow[];
  parentOptions: MenuItemRow[];
  modules: ModuleRow[];
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      href: "",
      icon: "FileText",
      group_id: groups[0]?.id ?? "",
      parent_id: "",
      module_key: modules[0]?.key ?? "",
      always_visible: false,
      show_bottom_nav: false,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const input: MenuItemInput = {
        ...values,
        parent_id: values.parent_id || null,
      };
      if (itemId) {
        await updateMenuItem(itemId, input);
      } else {
        await createMenuItem(input);
      }
      toast.success("Menu berhasil disimpan");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan menu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Label" error={errors.label?.message}>
          <input {...register("label")} className={inputClass} placeholder="Products" />
        </Field>
        <Field label="Href" error={errors.href?.message} hint="Path halaman admin atau URL eksternal">
          <input {...register("href")} className={inputClass} placeholder="/admin/products" />
        </Field>
        <Field label="Modul" error={errors.group_id?.message}>
          <Controller
            name="group_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={groups.map((g) => ({ value: g.id, label: g.label }))}
              />
            )}
          />
        </Field>
        <Field label="Induk (opsional)">
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="— Tidak ada (menu utama) —"
                options={[
                  { value: "", label: "— Tidak ada (menu utama) —" },
                  ...parentOptions.filter((p) => p.id !== itemId).map((p) => ({ value: p.id, label: p.label })),
                ]}
              />
            )}
          />
        </Field>
        <Field label="Ikon" error={errors.icon?.message}>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label="Kunci Hak Akses" error={errors.module_key?.message}>
          <Controller
            name="module_key"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={modules.map((m) => ({ value: m.key, label: m.label }))}
              />
            )}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm text-ink-700">
          <input type="checkbox" {...register("always_visible")} className="h-4 w-4 rounded border-ink-900/20" />
          Selalu Terlihat (lewati cek permission)
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm text-ink-700">
          <input type="checkbox" {...register("show_bottom_nav")} className="h-4 w-4 rounded border-ink-900/20" />
          Tampilkan di Bottom Nav (mobile)
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Menu
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
