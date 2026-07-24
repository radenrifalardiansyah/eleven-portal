"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createRole, updateRole } from "@/app/admin/(dashboard)/role-master/actions";
import IconPicker from "@/components/admin/IconPicker";
import type { RoleRow } from "@/lib/cms/roles";

const schema = z.object({
  key: z
    .string()
    .min(1, "Key wajib diisi")
    .regex(/^[a-z][a-z0-9_]*$/, "Hanya huruf kecil, angka, underscore (mis. marketing)"),
  label: z.string().min(1, "Label wajib diisi"),
  icon: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function RoleForm({
  defaultValues,
  onSuccess,
  onCancel,
}: {
  defaultValues?: RoleRow;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isEdit = !!defaultValues;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: defaultValues?.key ?? "",
      label: defaultValues?.label ?? "",
      icon: defaultValues?.icon ?? "Users",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateRole(values.key, {
          label: values.label,
          icon: values.icon,
        });
      } else {
        await createRole(values);
      }
      toast.success("Role berhasil disimpan");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan role");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Key"
          error={errors.key?.message}
          hint={isEdit ? "Key tidak bisa diubah setelah dibuat" : "Huruf kecil, mis. marketing"}
        >
          <input {...register("key")} disabled={isEdit} className={inputClass} placeholder="marketing" />
        </Field>
        <Field label="Label" error={errors.label?.message}>
          <input {...register("label")} className={inputClass} placeholder="Marketing" />
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
        Hak akses role ini per modul (view/edit/delete/dst) diatur lewat halaman Hak Akses Role setelah role ini
        dibuat.
      </p>

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
          Simpan Role
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
