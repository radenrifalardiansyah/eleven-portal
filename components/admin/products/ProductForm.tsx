"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import TagInput from "@/components/admin/TagInput";
import { ImageUploader, GalleryUploader } from "@/components/admin/ImageUploader";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { getStatusOptions } from "@/components/admin/StatusOptions";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/(dashboard)/products/actions";
import type { Service } from "@/lib/cms/services";
import { CURRENCY_OPTIONS, formatPrice } from "@/lib/currency";
import {
  PACKAGE_DISCOUNT_OPTIONS,
  createEmptyPackage,
  packageFinalPrice,
} from "@/lib/cms/product-packages";

const packageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama paket wajib diisi"),
  price_amount: z.number({ error: "Harga wajib diisi" }).min(0, "Harga tidak boleh negatif"),
  discount_type: z.enum(["none", "percent", "amount"]),
  discount_value: z.number().min(0, "Nilai diskon tidak boleh negatif"),
  description: z.string(),
});

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  name: z.string().min(1, "Nama wajib diisi"),
  service_id: z.string().min(1, "Layanan wajib dipilih"),
  price_currency: z.enum(["IDR", "USD", "SGD", "EUR", "MYR"]),
  packages: z.array(packageSchema).min(1, "Minimal 1 paket harga"),
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      name: "",
      service_id: "",
      price_currency: "IDR",
      packages: [createEmptyPackage()],
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

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control,
    name: "packages",
  });
  const currency = watch("price_currency");

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
        <Field label="Mata Uang" error={errors.price_currency?.message} hint="Berlaku untuk semua paket harga di bawah">
          <Controller
            control={control}
            name="price_currency"
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={CURRENCY_OPTIONS}
                placeholder="Mata uang"
              />
            )}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink-700">Paket Harga</label>
          <button
            type="button"
            onClick={() => appendPackage(createEmptyPackage())}
            className="flex items-center gap-1.5 rounded-lg border border-ink-900/10 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-900/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Paket
          </button>
        </div>
        {errors.packages?.message && (
          <p className="text-xs text-red-600">{errors.packages.message as string}</p>
        )}

        <div className="space-y-3">
          {packageFields.map((field, index) => {
            const pkgErrors = errors.packages?.[index];
            const values = watch(`packages.${index}`);
            const discountType = values?.discount_type ?? "none";
            const finalPrice = values ? packageFinalPrice(values) : 0;
            return (
              <div key={field.id} className="rounded-xl border border-ink-900/10 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Nama Paket" error={pkgErrors?.name?.message}>
                    <input
                      {...register(`packages.${index}.name`)}
                      className={inputClass}
                      placeholder="Paket Basic"
                    />
                  </Field>
                  <Field label="Harga" error={pkgErrors?.price_amount?.message}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`packages.${index}.price_amount`, { valueAsNumber: true })}
                      className={inputClass}
                      placeholder="3500000"
                    />
                  </Field>
                  <Field label="Tipe Diskon">
                    <Controller
                      control={control}
                      name={`packages.${index}.discount_type`}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={PACKAGE_DISCOUNT_OPTIONS}
                        />
                      )}
                    />
                  </Field>
                  <Field label="Nilai Diskon" error={pkgErrors?.discount_value?.message}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={discountType === "none"}
                      {...register(`packages.${index}.discount_value`, { valueAsNumber: true })}
                      className={`${inputClass} disabled:opacity-50`}
                      placeholder={discountType === "percent" ? "10" : "100000"}
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Keterangan">
                    <textarea
                      {...register(`packages.${index}.description`)}
                      rows={2}
                      className={inputClass}
                      placeholder="Cocok untuk usaha kecil yang baru mulai"
                    />
                  </Field>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-blue">
                    Harga Akhir: {formatPrice(finalPrice, currency)}
                  </p>
                  <button
                    type="button"
                    disabled={packageFields.length === 1}
                    onClick={() => removePackage(index)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    aria-label="Hapus paket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
