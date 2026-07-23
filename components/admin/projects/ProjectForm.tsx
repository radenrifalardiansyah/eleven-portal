"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import TagInput from "@/components/admin/TagInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import StatusOptions from "@/components/admin/StatusOptions";
import { createProject, updateProject, type ProjectInput } from "@/app/admin/(dashboard)/projects/actions";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  title: z.string().min(1, "Judul wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  year: z.string().min(1, "Tahun wajib diisi"),
  image: z.string().min(1, "Gambar wajib diunggah"),
  href: z.string().min(1, "Link proyek wajib diisi"),
  description: z.string().min(1, "Deskripsi singkat wajib diisi"),
  long_description: z.string().min(1, "Deskripsi lengkap wajib diisi"),
  services: z.array(z.string()).min(1, "Minimal 1 layanan"),
  status: z.enum(["draft", "pending", "published"]),
  sort_order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

export default function ProjectForm({
  projectId,
  defaultValues,
  canPublish,
  onSuccess,
  onCancel,
}: {
  projectId?: string;
  defaultValues?: Partial<FormValues>;
  canPublish: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      title: "",
      category: "",
      year: "",
      image: "",
      href: "",
      description: "",
      long_description: "",
      services: [],
      status: "draft",
      sort_order: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (projectId) {
        await updateProject(projectId, values as ProjectInput);
      } else {
        await createProject(values as ProjectInput);
      }
      toast.success("Case study berhasil disimpan");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan case study");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Judul Proyek" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Dipakai di URL, huruf kecil & strip">
          <input {...register("slug")} className={inputClass} />
        </Field>
        <Field label="Kategori" error={errors.category?.message}>
          <input {...register("category")} className={inputClass} placeholder="Web Development - Landing Page" />
        </Field>
        <Field label="Tahun" error={errors.year?.message}>
          <input {...register("year")} className={inputClass} placeholder="2024" />
        </Field>
        <Field label="Link Live Site" error={errors.href?.message}>
          <input {...register("href")} className={inputClass} placeholder="https://..." />
        </Field>
      </div>

      <Field label="Deskripsi Singkat" error={errors.description?.message}>
        <textarea {...register("description")} rows={2} className={inputClass} />
      </Field>

      <Field label="Deskripsi Lengkap" error={errors.long_description?.message}>
        <textarea {...register("long_description")} rows={5} className={inputClass} />
      </Field>

      <Field label="Layanan Terkait" error={errors.services?.message as string | undefined}>
        <Controller
          control={control}
          name="services"
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} placeholder="Tambah layanan, Enter untuk simpan" />
          )}
        />
      </Field>

      <Field label="Gambar" error={errors.image?.message}>
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} pathPrefix="projects" />
          )}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Urutan Tampil">
          <input type="number" {...register("sort_order", { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Status">
          <select {...register("status")} className={inputClass}>
            <StatusOptions canPublish={canPublish} />
          </select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/projects"))}
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
          Simpan Case Study
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
