"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createMenuItem, updateMenuItem, type MenuItemInput } from "@/app/admin/(dashboard)/menu-struktur/actions";
import IconPicker from "@/components/admin/IconPicker";
import SearchableSelect from "@/components/admin/SearchableSelect";
import type { MenuGroupRow, MenuItemRow } from "@/lib/cms/menu";

const schema = z
  .object({
    label: z.string().min(1, "Label wajib diisi"),
    // Optional for top-level items so a menu can be a pure category — a
    // dropdown that only expands its children (like the account menu in the
    // navbar) instead of linking anywhere. Sub-menus (parent_id set) always
    // need a real destination, enforced below since a child without an href
    // would be a dead end.
    href: z.string(),
    icon: z.string().min(1),
    group_id: z.string().min(1, "Modul wajib dipilih"),
    parent_id: z.string(),
    always_visible: z.boolean(),
    show_bottom_nav: z.boolean(),
    show_on_portal: z.boolean(),
    show_section_on_portal: z.boolean(),
    portal_href: z.string(),
    portal_match_path: z.string(),
    portal_label: z.string(),
  })
  .superRefine((values, ctx) => {
    const href = values.href.trim();
    if (!href) {
      if (values.parent_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["href"], message: "Href wajib diisi untuk sub-menu" });
      }
      if (values.show_bottom_nav) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["show_bottom_nav"],
          message: "Menu tanpa href tidak bisa ditampilkan di Bottom Nav",
        });
      }
      return;
    }
    if (!(href.startsWith("/") || href.startsWith("http"))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["href"],
        message: "Href harus path (/admin/...) atau URL eksternal (https://...)",
      });
    }
  })
  .superRefine((values, ctx) => {
    if (values.show_on_portal && !values.portal_href.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["portal_href"],
        message: "Portal Href wajib diisi jika Tampil di Portal aktif",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function slugifyModuleKey(href: string) {
  const slug = href
    .replace(/^\/admin\/?/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "menu";
}

export default function MenuItemForm({
  itemId,
  defaultValues,
  existingModuleKey,
  groups,
  parentOptions,
  onSuccess,
  onCancel,
}: {
  itemId?: string;
  defaultValues?: Partial<FormValues>;
  /** module_key already assigned to this item — read-only, shown for context only. */
  existingModuleKey?: string;
  groups: MenuGroupRow[];
  parentOptions: MenuItemRow[];
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      href: "",
      icon: "FileText",
      group_id: groups[0]?.id ?? "",
      parent_id: "",
      always_visible: false,
      show_bottom_nav: false,
      show_on_portal: false,
      show_section_on_portal: true,
      portal_href: "",
      portal_match_path: "",
      portal_label: "",
      ...defaultValues,
    },
  });

  const selectedGroupId = watch("group_id");
  const hrefValue = watch("href");
  const labelValue = watch("label");
  const parentIdValue = watch("parent_id");
  const showOnPortalValue = watch("show_on_portal");

  // Full tree across every Modul: group header, then its top-level menus,
  // then their existing children (greyed out — see below for why they can't
  // be picked). Shows the whole structure so it's clear where everything sits,
  // not just what's inside the currently selected Modul.
  const parentTreeOptions = useMemo(() => {
    const options: { value: string; label: string; disabled?: boolean; indent?: number }[] = [
      { value: "", label: "— Tidak ada (menu utama) —" },
    ];
    for (const group of groups) {
      const topLevel = parentOptions
        .filter((p) => p.group_id === group.id && !p.parent_id && p.id !== itemId)
        .sort((a, b) => a.sort_order - b.sort_order);
      if (topLevel.length === 0) continue;
      options.push({ value: `__group_${group.id}`, label: group.label, disabled: true });
      for (const parent of topLevel) {
        options.push({ value: parent.id, label: parent.label, indent: 1 });
        // The sidebar only renders 2 levels (top-level item + its direct
        // children — see AdminChrome) and only within the same Modul, so a
        // child-of-a-child, or a parent from a different Modul, would just
        // silently never show up. Listed here for context only, not selectable.
        const children = parentOptions
          .filter((c) => c.parent_id === parent.id && c.id !== itemId)
          .sort((a, b) => a.sort_order - b.sort_order);
        for (const child of children) {
          options.push({ value: child.id, label: child.label, indent: 2, disabled: true });
        }
      }
    }
    return options;
  }, [parentOptions, groups, itemId]);

  function handleParentChange(value: string, onChange: (v: string) => void) {
    onChange(value);
    if (!value) return;
    // Picking a parent from another Modul must move this item into that
    // Modul too — a parent and its child always render together, in one group.
    const parent = parentOptions.find((p) => p.id === value);
    if (parent && parent.group_id !== selectedGroupId) setValue("group_id", parent.group_id);
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const input: MenuItemInput = {
        ...values,
        href: values.href.trim() || null,
        parent_id: values.parent_id || null,
        portal_href: values.portal_href.trim() || null,
        portal_match_path: values.portal_match_path.trim() || null,
        portal_label: values.portal_label.trim() || null,
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
        <Field
          label={parentIdValue ? "Href" : "Href (opsional)"}
          error={errors.href?.message}
          hint={
            parentIdValue
              ? "Path halaman admin atau URL eksternal"
              : "Path halaman admin atau URL eksternal — kosongkan jika menu ini cuma kategori pembuka sub-menu (tanpa halaman sendiri)"
          }
        >
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
        <Field
          label="Induk (opsional)"
          hint="Pilih menu utama sebagai induk — Modul di atas otomatis ikut menyesuaikan"
        >
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={(value) => handleParentChange(value, field.onChange)}
                placeholder="— Tidak ada (menu utama) —"
                options={parentTreeOptions}
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
      </div>

      <p className="text-xs text-ink-500">
        Kunci hak akses:{" "}
        <span className="rounded bg-ink-900/[0.04] px-1.5 py-0.5 font-mono text-ink-700">
          {existingModuleKey ?? slugifyModuleKey(hrefValue.trim() || labelValue || "menu")}
        </span>{" "}
        {existingModuleKey
          ? "(tetap, mengikuti menu ini)"
          : `(otomatis dari ${hrefValue.trim() ? "Href" : "Label"}, tidak perlu diisi manual)`}{" "}
        — diatur per role di Hak Akses Role.
      </p>

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm text-ink-700">
          <input type="checkbox" {...register("show_on_portal")} className="h-4 w-4 rounded border-ink-900/20" />
          Tampil di Menu (navbar halaman publik)
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            {...register("show_section_on_portal")}
            className="h-4 w-4 rounded border-ink-900/20"
          />
          Tampil sebagai Section (halaman utama)
        </label>
      </div>
      <p className="text-xs text-ink-500">
        Urutan tampil di navbar publik &amp; section halaman utama mengikuti urutan menu ini di sidebar admin —
        atur pakai tombol panah atas/bawah di daftar menu.
      </p>

      {showOnPortalValue && (
        <div className="grid grid-cols-1 gap-5 rounded-xl border border-ink-900/10 p-4 sm:grid-cols-2">
          <Field
            label="Portal Href"
            error={errors.portal_href?.message}
            hint="Tujuan link di navbar publik, mis. /#services atau /services"
          >
            <input {...register("portal_href")} className={inputClass} placeholder="/#services" />
          </Field>
          <Field label="Portal Match Path (opsional)" hint="Path yang membuat menu ini aktif di luar homepage">
            <input {...register("portal_match_path")} className={inputClass} placeholder="/services" />
          </Field>
          <Field label="Portal Label (opsional)" hint="Kosongkan untuk pakai Label yang sama dengan sidebar admin">
            <input {...register("portal_label")} className={inputClass} placeholder={labelValue || "Label"} />
          </Field>
        </div>
      )}

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
