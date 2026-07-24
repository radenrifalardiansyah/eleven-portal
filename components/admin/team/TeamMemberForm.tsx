"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, Link2, Check } from "lucide-react";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { getStatusOptions } from "@/components/admin/StatusOptions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import TeamAvatar from "@/components/ui/TeamAvatar";
import {
  createTeamMember,
  updateTeamMember,
  type TeamMemberInput,
} from "@/app/admin/(dashboard)/team/actions";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  name: z.string().min(1, "Nama wajib diisi"),
  position: z.string().min(1, "Jabatan wajib diisi"),
  bio: z.string().min(1, "Bio singkat wajib diisi"),
  long_bio: z.string().min(1, "Bio lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  status: z.enum(["draft", "pending", "published"]),
  sort_order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

export default function TeamMemberForm({
  memberId,
  defaultValues,
  canPublish,
  onSuccess,
  onCancel,
}: {
  memberId?: string;
  defaultValues?: Partial<FormValues> & {
    photo_url?: string | null;
    socials?: { instagram?: string; facebook?: string; twitter?: string };
  };
  canPublish: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(defaultValues?.photo_url ?? "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState(defaultValues?.photo_url ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: defaultValues?.slug ?? "",
      name: defaultValues?.name ?? "",
      position: defaultValues?.position ?? "",
      bio: defaultValues?.bio ?? "",
      long_bio: defaultValues?.long_bio ?? "",
      email: defaultValues?.email ?? "",
      instagram: defaultValues?.socials?.instagram ?? "",
      facebook: defaultValues?.socials?.facebook ?? "",
      twitter: defaultValues?.socials?.twitter ?? "",
      status: defaultValues?.status ?? "draft",
      sort_order: defaultValues?.sort_order ?? 0,
    },
  });

  async function handlePhotoFile(file: File) {
    setUploadingPhoto(true);
    try {
      const url = await uploadMediaFile(file, "team");
      setPhotoUrl(url);
      setLinkValue(url);
      toast.success("Foto diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const input: TeamMemberInput = {
        slug: values.slug,
        name: values.name,
        position: values.position,
        bio: values.bio,
        long_bio: values.long_bio,
        email: values.email,
        photo_url: photoUrl.trim() || null,
        socials: {
          ...(values.instagram ? { instagram: values.instagram } : {}),
          ...(values.facebook ? { facebook: values.facebook } : {}),
          ...(values.twitter ? { twitter: values.twitter } : {}),
        },
        status: values.status,
        sort_order: values.sort_order,
      };

      if (memberId) {
        await updateTeamMember(memberId, input);
      } else {
        await createTeamMember(input);
      }
      toast.success("Anggota tim berhasil disimpan");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/team");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan anggota tim");
    } finally {
      setSubmitting(false);
    }
  }

  const nameValue = watch("name");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-3">
        <label className="text-sm font-medium text-ink-700">Foto</label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <TeamAvatar name={nameValue || "?"} photoUrl={photoUrl} className="h-full w-full" />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="flex items-center gap-2 rounded-xl bg-brand-blue/10 px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/20 disabled:opacity-60"
          >
            {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Foto
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
              if (file) handlePhotoFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {linkMode && (
          <div className="flex gap-2">
            <input
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => {
                setPhotoUrl(linkValue);
                setLinkMode(false);
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-light"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
        <p className="text-xs text-ink-500">Kosongkan untuk memakai avatar inisial nama otomatis</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama" error={errors.name?.message}>
          <input {...register("name")} className={inputClass} />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Dipakai di URL, huruf kecil & strip">
          <input {...register("slug")} className={inputClass} />
        </Field>
        <Field label="Jabatan" error={errors.position?.message}>
          <input {...register("position")} className={inputClass} placeholder="Chief Executive Officer" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register("email")} className={inputClass} />
        </Field>
      </div>

      <Field label="Bio Singkat" error={errors.bio?.message}>
        <textarea {...register("bio")} rows={2} className={inputClass} />
      </Field>

      <Field label="Bio Lengkap" error={errors.long_bio?.message}>
        <textarea {...register("long_bio")} rows={5} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Instagram">
          <input {...register("instagram")} className={inputClass} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="Facebook">
          <input {...register("facebook")} className={inputClass} placeholder="https://facebook.com/..." />
        </Field>
        <Field label="Twitter / X">
          <input {...register("twitter")} className={inputClass} placeholder="https://x.com/..." />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Urutan Tampil">
          <input type="number" {...register("sort_order", { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={getStatusOptions(canPublish)}
              />
            )}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/team"))}
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
          Simpan Anggota
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
