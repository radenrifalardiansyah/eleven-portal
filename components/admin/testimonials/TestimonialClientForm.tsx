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
import {
  createTestimonialClient,
  updateTestimonialClient,
  type TestimonialClientInput,
} from "@/app/admin/(dashboard)/testimonials/actions";

const RATING_OPTIONS = [
  { value: "", label: "Tidak ada rating" },
  { value: "1", label: "★ 1" },
  { value: "2", label: "★★ 2" },
  { value: "3", label: "★★★ 3" },
  { value: "4", label: "★★★★ 4" },
  { value: "5", label: "★★★★★ 5" },
];

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  name: z.string().min(1, "Nama klien wajib diisi"),
  logo: z.string().min(1, "Logo wajib diunggah"),
  industry: z.string(),
  website: z.string(),
  description: z.string(),
  contact_name: z.string(),
  contact_position: z.string(),
  contact_email: z.string().email("Format email tidak valid").or(z.literal("")),
  contact_phone: z.string(),
  testimonial_quote: z.string(),
  testimonial_author: z.string(),
  testimonial_rating: z.string(),
  status: z.enum(["draft", "pending", "published"]),
  sort_order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

export default function TestimonialClientForm({
  clientId,
  defaultValues,
  canPublish,
  onSuccess,
  onCancel,
}: {
  clientId?: string;
  defaultValues?: Partial<Omit<FormValues, "testimonial_rating">> & {
    testimonial_rating?: number | null;
  };
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
      slug: defaultValues?.slug ?? "",
      name: defaultValues?.name ?? "",
      logo: defaultValues?.logo ?? "",
      industry: defaultValues?.industry ?? "",
      website: defaultValues?.website ?? "",
      description: defaultValues?.description ?? "",
      contact_name: defaultValues?.contact_name ?? "",
      contact_position: defaultValues?.contact_position ?? "",
      contact_email: defaultValues?.contact_email ?? "",
      contact_phone: defaultValues?.contact_phone ?? "",
      testimonial_quote: defaultValues?.testimonial_quote ?? "",
      testimonial_author: defaultValues?.testimonial_author ?? "",
      testimonial_rating: defaultValues?.testimonial_rating ? String(defaultValues.testimonial_rating) : "",
      status: defaultValues?.status ?? "draft",
      sort_order: defaultValues?.sort_order ?? 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload: TestimonialClientInput = {
        ...values,
        testimonial_rating: values.testimonial_rating ? Number(values.testimonial_rating) : null,
      };
      if (clientId) {
        await updateTestimonialClient(clientId, payload);
      } else {
        await createTestimonialClient(payload);
      }
      toast.success("Klien berhasil disimpan");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/testimonials");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan klien");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama Klien" error={errors.name?.message}>
          <input {...register("name")} className={inputClass} />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Dipakai sebagai identifier, huruf kecil & strip">
          <input {...register("slug")} className={inputClass} />
        </Field>
      </div>

      <Field label="Logo" error={errors.logo?.message}>
        <Controller
          control={control}
          name="logo"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} pathPrefix="clients" />
          )}
        />
      </Field>

      <SectionHeading title="Info Perusahaan" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Industri" hint="Contoh: Perbankan, F&B, Manufaktur">
          <input {...register("industry")} className={inputClass} />
        </Field>
        <Field label="Website">
          <input {...register("website")} className={inputClass} placeholder="https://" />
        </Field>
      </div>
      <Field label="Deskripsi Singkat Perusahaan">
        <textarea {...register("description")} rows={2} className={inputClass} />
      </Field>

      <SectionHeading title="Kontak PIC" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama PIC">
          <input {...register("contact_name")} className={inputClass} />
        </Field>
        <Field label="Jabatan PIC">
          <input {...register("contact_position")} className={inputClass} />
        </Field>
        <Field label="Email PIC" error={errors.contact_email?.message}>
          <input type="email" {...register("contact_email")} className={inputClass} />
        </Field>
        <Field label="No. Telepon/WhatsApp PIC">
          <input {...register("contact_phone")} className={inputClass} />
        </Field>
      </div>

      <SectionHeading title="Testimoni" />
      <Field label="Kutipan Testimoni">
        <textarea
          {...register("testimonial_quote")}
          rows={3}
          className={inputClass}
          placeholder="Apa kata klien tentang layanan kami..."
        />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama Pemberi Testimoni">
          <input {...register("testimonial_author")} className={inputClass} />
        </Field>
        <Field label="Rating">
          <Controller
            control={control}
            name="testimonial_rating"
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={RATING_OPTIONS}
                placeholder="Pilih rating"
              />
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
          onClick={() => (onCancel ? onCancel() : router.push("/admin/testimonials"))}
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
          Simpan Klien
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

function SectionHeading({ title }: { title: string }) {
  return (
    <p className="border-t border-ink-900/5 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
      {title}
    </p>
  );
}

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
