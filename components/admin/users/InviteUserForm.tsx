"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { inviteUser } from "@/app/admin/(dashboard)/users/actions";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { ICON_MAP } from "@/components/admin/icon-map";
import type { RoleRow } from "@/lib/cms/roles";
import type { UserRole } from "@/lib/supabase/types";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
  fullName: z.string().min(1, "Nama wajib diisi"),
  role: z.string().min(1, "Role wajib dipilih"),
});

type FormValues = z.infer<typeof schema>;

export default function InviteUserForm({ roles, onSuccess }: { roles: RoleRow[]; onSuccess?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", fullName: "", role: roles.find((r) => r.key === "employee")?.key ?? roles[0]?.key ?? "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await inviteUser(values.email, values.fullName, values.role as UserRole);
      toast.success("Undangan berhasil dikirim ke email tersebut");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim undangan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Nama Lengkap" error={errors.fullName?.message}>
        <input {...register("fullName")} className={inputClass} />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <input type="email" {...register("email")} className={inputClass} placeholder="nama@elevendigital.com" />
      </Field>

      <Field label="Role" error={errors.role?.message}>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={field.onChange}
              options={roles.map((role) => ({ value: role.key, label: role.label, icon: ICON_MAP[role.icon] }))}
            />
          )}
        />
      </Field>

      <p className="text-xs text-ink-500">
        Undangan akan dikirim lewat email berisi tautan untuk membuat password akun.
      </p>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirim Undangan
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
