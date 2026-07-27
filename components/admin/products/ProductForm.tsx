"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import TagInput from "@/components/admin/TagInput";
import { ImageUploader, GalleryUploader } from "@/components/admin/ImageUploader";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { getStatusOptions } from "@/components/admin/StatusOptions";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/(dashboard)/products/actions";
import type { Service } from "@/lib/cms/services";
import { CURRENCY_OPTIONS } from "@/lib/currency";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  name: z.string().min(1, "Nama wajib diisi"),
  service_id: z.string().min(1, "Layanan wajib dipilih"),
  price_amount: z.number({ error: "Harga wajib diisi" }).min(0, "Harga tidak boleh negatif"),
  price_currency: z.enum(["IDR", "USD", "SGD", "EUR", "MYR"]),
  description: z.string().min(1, "Deskripsi singkat wajib diisi"),
  long_description: z.string().min(1, "Deskripsi lengkap wajib diisi"),
  features: z.array(z.string()).min(1, "Minimal 1 fitur"),
  gallery: z.array(z.string()),
  image: z.string().min(1, "Gambar utama wajib diunggah"),
  status: z.enum(["draft", "pending", "published"]),
  sort_order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

export default function ProductForm({
  productId,
  defaultValues,
  services,
  canPublish,
  onSuccess,
  onCancel,
}: {
  productId?: string;
  defaultValues?: Partial<FormValues>;
  services: Service[];
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
      service_id: "",
      price_amount: 0,
      price_currency: "IDR",
      description: "",
      long_description: "",
      features: [],
      gallery: [],
      image: "",
      status: "draft",
      sort_order: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (productId) {
        await updateProduct(productId, values as ProductInput);
      } else {
        await createProduct(values as ProductInput);
      }
      toast.success("Produk berhasil disimpan");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nama Produk" error={errors.name?.message}>
          <input {...register("name")} className={inputClass} placeholder="Website Company Profile" />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Dipakai di URL, huruf kecil & strip">
          <input {...register("slug")} className={inputClass} placeholder="website-company-profile" />
        </Field>
        <Field label="Layanan" error={errors.service_id?.message}>
          <Controller
            control={control}
            name="service_id"
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={services.map((s) => ({ value: s.id, label: s.title }))}
                placeholder="Pilih layanan"
              />
            )}
          />
        </Field>
        <Field label="Harga" error={errors.price_amount?.message ?? errors.price_currency?.message}>
          <div className="flex gap-2">
            <Controller
              control={control}
              name="price_currency"
              render={({ field }) => (
                <div className="w-32 shrink-0">
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={CURRENCY_OPTIONS}
                    placeholder="Mata uang"
                  />
                </div>
              )}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("price_amount", { valueAsNumber: true })}
              className={inputClass}
              placeholder="3500000"
            />
          </div>
        </Field>
      </div>

      <Field label="Deskripsi Singkat" error={errors.description?.message}>
        <textarea {...register("description")} rows={2} className={inputClass} />
      </Field>

      <Field label="Deskripsi Lengkap" error={errors.long_description?.message}>
        <textarea {...register("long_description")} rows={5} className={inputClass} />
      </Field>

      <Field label="Fitur" error={errors.features?.message as string | undefined}>
        <Controller
          control={control}
          name="features"
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} placeholder="Tambah fitur, Enter untuk simpan" />
          )}
        />
      </Field>

      <Field label="Gambar Utama" error={errors.image?.message}>
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} pathPrefix="products" />
          )}
        />
      </Field>

      <Field label="Galeri">
        <Controller
          control={control}
          name="gallery"
          render={({ field }) => (
            <GalleryUploader value={field.value} onChange={field.onChange} pathPrefix="products" />
          )}
        />
      </Field>

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
          onClick={() => (onCancel ? onCancel() : router.push("/admin/products"))}
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
          Simpan Produk
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
