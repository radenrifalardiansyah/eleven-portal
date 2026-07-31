import type { Product } from "@/lib/cms/products";
import type { ProductImportRow } from "@/app/admin/(dashboard)/products/actions";
import { exportImportTemplate, type TemplateColumn } from "@/lib/excel";
import { isCurrencyCode } from "@/lib/currency";
import type { PackageDiscountType, ProductPackage } from "@/lib/cms/product-packages";

const DISCOUNT_LABEL: Record<PackageDiscountType, string> = {
  none: "Tanpa",
  percent: "Persen",
  amount: "Nominal",
};
const DISCOUNT_FROM_LABEL: Record<string, PackageDiscountType> = {
  tanpa: "none",
  persen: "percent",
  nominal: "amount",
};

export function productToExcelRow(p: Product) {
  return {
    Slug: p.slug,
    Nama: p.name,
    Layanan: p.serviceTitle,
    "Mata Uang": p.price_currency,
    "Paket Harga": packagesToExcelValue(p.packages),
    "Deskripsi Singkat": p.description,
    "Deskripsi Lengkap": p.long_description,
    Fitur: p.features.join(" | "),
    Galeri: p.gallery.join(" | "),
    "Gambar Utama": p.image,
    Status: p.status,
    Urutan: p.sort_order,
  };
}

export function excelRowToProductImportRow(row: Record<string, string>): ProductImportRow | null {
  const slug = row["Slug"]?.trim();
  const name = row["Nama"]?.trim();
  if (!slug || !name) return null;

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  const rawCurrency = row["Mata Uang"]?.trim().toUpperCase() ?? "";
  const price_currency = isCurrencyCode(rawCurrency) ? rawCurrency : "IDR";

  return {
    slug,
    name,
    service: row["Layanan"]?.trim() ?? "",
    price_currency,
    packages: excelValueToPackages(row["Paket Harga"]),
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

function packagesToExcelValue(packages: ProductPackage[]): string {
  return packages
    .map((p) =>
      [p.name, p.price_amount, DISCOUNT_LABEL[p.discount_type], p.discount_value, p.description].join("|")
    )
    .join(" ; ");
}

function excelValueToPackages(value: string | undefined): ProductPackage[] {
  if (!value) return [];
  return value
    .split(";")
    .map((chunk) => {
      const [name = "", price = "0", discountLabel = "Tanpa", discountValue = "0", ...descParts] = chunk
        .split("|")
        .map((v) => v.trim());
      return {
        id: crypto.randomUUID(),
        name,
        price_amount: Number(price) || 0,
        discount_type: DISCOUNT_FROM_LABEL[discountLabel.toLowerCase()] ?? "none",
        discount_value: Number(discountValue) || 0,
        description: descParts.join("|").trim(),
      };
    })
    .filter((p) => p.name);
}

const PRODUCT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Slug",
    example: "website-company-profile",
    note: "Wajib diisi & unik antar produk. Huruf kecil, angka, dan strip saja (tanpa spasi), contoh: website-company-profile. Ini dipakai di URL halaman produk.",
  },
  {
    header: "Nama",
    example: "Website Company Profile",
    note: "Wajib diisi. Nama produk yang tampil di website.",
  },
  {
    header: "Layanan",
    example: "Web Development",
    note: "Nama layanan yang sudah ada di menu Layanan, harus sama persis, contoh: Web Development, Graphic Design.",
  },
  {
    header: "Mata Uang",
    example: "IDR",
    note: "Isi salah satu: IDR, USD, SGD, EUR, atau MYR. Boleh dikosongkan (default IDR). Berlaku untuk semua paket harga produk ini.",
  },
  {
    header: "Paket Harga",
    example: "Paket Basic|3500000|Tanpa|0|Cocok untuk UMKM ; Paket Pro|7500000|Persen|10|Untuk bisnis menengah",
    note:
      "Wajib diisi minimal 1 paket. Format tiap paket: Nama|Harga|TipeDiskon|NilaiDiskon|Keterangan, dipisah tanda | (pipe). TipeDiskon isi salah satu: Tanpa, Persen, atau Nominal. Jika lebih dari 1 paket, pisahkan tiap paket dengan tanda ; (titik koma). Contoh: Paket Basic|3500000|Tanpa|0|Cocok untuk UMKM ; Paket Pro|7500000|Persen|10|Untuk bisnis menengah",
  },
  {
    header: "Deskripsi Singkat",
    example: "Website profil perusahaan yang modern, responsif, dan siap tayang dalam 7 hari.",
    note: "Ringkasan 1-2 kalimat, tampil di daftar/kartu produk.",
  },
  {
    header: "Deskripsi Lengkap",
    example: "Paket ini cocok untuk perusahaan yang ingin tampil profesional secara online, lengkap dengan halaman profil, layanan, dan kontak.",
    note: "Deskripsi detail, tampil di halaman detail produk.",
  },
  {
    header: "Fitur",
    example: "Desain Responsif | SEO Friendly | Gratis Domain 1 Tahun",
    note: "Daftar fitur dipisah tanda | (pipe). Contoh: Fitur A | Fitur B | Fitur C. Boleh dikosongkan.",
  },
  {
    header: "Galeri",
    example: "",
    note: "Link gambar galeri tambahan, dipisah tanda | (pipe) jika lebih dari satu. Upload gambar lewat form Tambah/Edit Produk terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini. Boleh dikosongkan.",
  },
  {
    header: "Gambar Utama",
    example: "https://contoh-domain.com/storage/products/gambar-utama.jpg",
    note: "Wajib diisi. Link gambar utama produk. Upload gambar lewat form Tambah/Edit Produk terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini.",
  },
  {
    header: "Status",
    example: "draft",
    note: "Isi salah satu: draft, pending, atau published. Kalau akun Anda tidak punya izin publish, status published akan otomatis diturunkan menjadi pending.",
  },
  {
    header: "Urutan",
    example: "0",
    note: "Angka urutan tampil di halaman publik. Semakin kecil angkanya, semakin di atas/duluan tampil. Boleh dikosongkan (default 0).",
  },
];

export function downloadProductImportTemplate() {
  const exampleRow = Object.fromEntries(PRODUCT_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  exportImportTemplate("template-import-produk", PRODUCT_TEMPLATE_COLUMNS, [exampleRow]);
}
