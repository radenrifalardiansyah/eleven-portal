"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { getStatusOptions } from "@/components/admin/StatusOptions";
import { createStory, updateStory, type StoryInput } from "@/app/admin/(dashboard)/stories/actions";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  title: z.string().min(1, "Judul wajib diisi"),
  label: z.string().min(1, "Label wajib diisi"),
  label_color: z.enum(["yellow", "blue"]),
  description: z.string().min(1, "Deskripsi singkat wajib diisi"),
  content: z.array(z.string()).min(1, "Isi artikel wajib diisi"),
  image: z.string().min(1, "Gambar wajib diunggah"),
  author: z.string().min(1, "Nama penulis wajib diisi"),
  author_image: z.string().min(1, "Foto penulis wajib diunggah"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  status: z.enum(["draft", "pending", "published"]),
  sort_order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

export default function StoryForm({
  storyId,
  defaultValues,
  canPublish,
  onSuccess,
  onCancel,
}: {
  storyId?: string;
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
      label: "",
      label_color: "blue",
      description: "",
      content: [],
      image: "",
      author: "Tim Eleven Digital Indonesia",
      author_image: "",
      date: new Date().toISOString().slice(0, 10),
      status: "draft",
      sort_order: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (storyId) {
        await updateStory(storyId, values as StoryInput);
      } else {
        await createStory(values as StoryInput);
      }
      toast.success("Story berhasil disimpan");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/stories");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan story");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Judul" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} placeholder="Judul story" />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Dipakai di URL, huruf kecil & strip">
          <input {...register("slug")} className={inputClass} />
        </Field>
        <Field label="Label" error={errors.label?.message}>
          <input {...register("label")} className={inputClass} placeholder="Creative / Technology" />
        </Field>
        <Field label="Warna Label" error={errors.label_color?.message}>
          <Controller
            control={control}
            name="label_color"
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "blue", label: "Blue" },
                  { value: "yellow", label: "Yellow" },
                ]}
              />
            )}
          />
        </Field>
        <Field label="Penulis" error={errors.author?.message}>
          <input {...register("author")} className={inputClass} />
        </Field>
        <Field label="Tanggal" error={errors.date?.message}>
          <input type="date" {...register("date")} className={inputClass} />
        </Field>
      </div>

      <Field label="Deskripsi Singkat" error={errors.description?.message}>
        <textarea {...register("description")} rows={2} className={inputClass} />
      </Field>

      <Field
        label="Isi Artikel"
        error={errors.content?.message as string | undefined}
        hint="Pisahkan tiap paragraf dengan baris kosong"
      >
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <textarea
              value={field.value.join("\n\n")}
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                )
              }
              rows={8}
              className={inputClass}
            />
          )}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Gambar Cover" error={errors.image?.message}>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageUploader value={field.value} onChange={field.onChange} pathPrefix="stories" />
            )}
          />
        </Field>
        <Field label="Foto Penulis" error={errors.author_image?.message}>
          <Controller
            control={control}
            name="author_image"
            render={({ field }) => (
              <ImageUploader value={field.value} onChange={field.onChange} pathPrefix="stories/authors" />
            )}
          />
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
          onClick={() => (onCancel ? onCancel() : router.push("/admin/stories"))}
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
          Simpan Story
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
