import type { Product } from "@/lib/cms/products";
import type { ProductInput } from "@/app/admin/(dashboard)/products/actions";

export function productToExcelRow(p: Product) {
  return {
    Slug: p.slug,
    Nama: p.name,
    Kategori: p.category,
    Harga: p.price,
    "Deskripsi Singkat": p.description,
    "Deskripsi Lengkap": p.long_description,
    Fitur: p.features.join(" | "),
    Galeri: p.gallery.join(" | "),
    "Gambar Utama": p.image,
    Status: p.status,
    Urutan: p.sort_order,
  };
}

export function excelRowToProductInput(row: Record<string, string>): ProductInput | null {
  const slug = row["Slug"]?.trim();
  const name = row["Nama"]?.trim();
  if (!slug || !name) return null;

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    name,
    category: row["Kategori"]?.trim() ?? "",
    price: row["Harga"]?.trim() ?? "",
    description: row["Deskripsi Singkat"]?.trim() ?? "",
    long_description: row["Deskripsi Lengkap"]?.trim() ?? "",
    features: splitList(row["Fitur"]),
    gallery: splitList(row["Galeri"]),
    image: row["Gambar Utama"]?.trim() ?? "",
    status,
    sort_order: Number(row["Urutan"]) || 0,
  };
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}
