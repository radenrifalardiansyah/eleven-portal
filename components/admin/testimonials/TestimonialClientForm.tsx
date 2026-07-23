"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import StatusOptions from "@/components/admin/StatusOptions";
import {
  createTestimonialClient,
  updateTestimonialClient,
  type TestimonialClientInput,
} from "@/app/admin/(dashboard)/testimonials/actions";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  name: z.string().min(1, "Nama klien wajib diisi"),
  logo: z.string().min(1, "Logo wajib diunggah"),
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
      name: "",
      logo: "",
      status: "draft",
      sort_order: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (clientId) {
        await updateTestimonialClient(clientId, values as TestimonialClientInput);
      } else {
        await createTestimonialClient(values as TestimonialClientInput);
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
