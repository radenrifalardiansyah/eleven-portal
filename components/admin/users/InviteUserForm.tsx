"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, Link2, Check } from "lucide-react";
import { inviteUser, updateUserAvatarUrl, uploadUserAvatar } from "@/app/admin/(dashboard)/users/actions";
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePickFile(file: File) {
    setAvatarFile(file);
    setLinkMode(false);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    let userId: string;
    try {
      const result = await inviteUser(values.email, values.fullName, values.role as UserRole);
      userId = result.userId;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim undangan");
      setSubmitting(false);
      return;
    }

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.set("file", avatarFile);
        await uploadUserAvatar(userId, formData);
      } else if (linkValue.trim()) {
        await updateUserAvatarUrl(userId, linkValue.trim());
      }
      toast.success("Undangan berhasil dikirim ke email tersebut");
    } catch (err) {
      toast.warning(
        `Undangan terkirim, tapi foto profil gagal disimpan: ${err instanceof Error ? err.message : "kesalahan tidak diketahui"}`
      );
    } finally {
      setSubmitting(false);
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-ink-700">Foto Profil (opsional)</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-blue-light text-lg font-semibold text-white">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="" width={64} height={64} className="h-full w-full object-cover" unoptimized />
            ) : (
              "?"
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-brand-blue/10 px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/20"
          >
            <Upload className="h-4 w-4" />
            Pilih Foto
          </button>
          <button
            type="button"
            onClick={() => setLinkMode((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-900/5"
          >
            <Link2 className="h-4 w-4" />
            Pakai Link
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePickFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {linkMode && (
          <div className="flex items-center gap-2">
            <input
              value={linkValue}
              onChange={(e) => {
                setLinkValue(e.target.value);
                setAvatarFile(null);
                setAvatarPreview(e.target.value);
              }}
              placeholder="https://..."
              className={inputClass}
            />
            <Check className="h-4 w-4 shrink-0 text-brand-blue" />
          </div>
        )}

        <p className="text-xs text-ink-500">JPG atau PNG, disarankan rasio 1:1. Foto diunggah setelah undangan dikirim.</p>
      </div>

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
