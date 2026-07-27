import type { Project } from "@/lib/cms/projects";
import type { ProjectImportRow } from "@/app/admin/(dashboard)/projects/actions";
import { exportImportTemplate, type TemplateColumn } from "@/lib/excel";

export function projectToExcelRow(p: Project) {
  return {
    Slug: p.slug,
    Judul: p.title,
    Produk: p.productName,
    Client: p.clientName,
    Tahun: p.year,
    Gambar: p.image,
    Link: p.href,
    "Deskripsi Singkat": p.description,
    "Deskripsi Lengkap": p.long_description,
    Layanan: p.services.join(" | "),
    Status: p.status,
    Urutan: p.sort_order,
  };
}

export function excelRowToProjectInput(row: Record<string, string>): ProjectImportRow | null {
  const slug = row["Slug"]?.trim();
  const title = row["Judul"]?.trim();
  if (!slug || !title) return null;

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    title,
    product: row["Produk"]?.trim() ?? "",
    client: row["Client"]?.trim() ?? "",
    year: row["Tahun"]?.trim() ?? "",
    image: row["Gambar"]?.trim() ?? "",
    href: row["Link"]?.trim() ?? "",
    description: row["Deskripsi Singkat"]?.trim() ?? "",
    long_description: row["Deskripsi Lengkap"]?.trim() ?? "",
    services: splitList(row["Layanan"]),
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

const PROJECT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Slug",
    example: "website-toko-abc",
    note: "Wajib diisi & unik antar case study. Huruf kecil, angka, dan strip saja (tanpa spasi), contoh: website-toko-abc. Ini dipakai di URL halaman case study.",
  },
  {
    header: "Judul",
    example: "Website Toko ABC",
    note: "Wajib diisi. Judul case study yang tampil di website.",
  },
  {
    header: "Produk",
    example: "Website Company Profile",
    note: "Nama produk yang sudah ada di menu Produk, harus sama persis.",
  },
  {
    header: "Client",
    example: "PT ABC Indonesia",
    note: "Nama client yang sudah ada di menu Client, harus sama persis. Boleh dikosongkan jika tidak terkait client manapun.",
  },
  {
    header: "Tahun",
    example: "2026",
    note: "Tahun proyek dikerjakan, contoh: 2026.",
  },
  {
    header: "Gambar",
    example: "https://contoh-domain.com/storage/projects/gambar.jpg",
    note: "Wajib diisi. Link gambar utama case study. Upload gambar lewat form Tambah/Edit Case Study terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini.",
  },
  {
    header: "Link",
    example: "https://toko-abc.com",
    note: "Link website/proyek terkait (opsional). Boleh dikosongkan.",
  },
  {
    header: "Deskripsi Singkat",
    example: "Pembuatan website toko online untuk ABC dengan sistem katalog produk.",
    note: "Ringkasan 1-2 kalimat, tampil di daftar/kartu case study.",
  },
  {
    header: "Deskripsi Lengkap",
    example: "Proyek pengembangan website toko online lengkap dengan katalog produk, keranjang belanja, dan integrasi pembayaran.",
    note: "Deskripsi detail, tampil di halaman detail case study.",
  },
  {
    header: "Layanan",
    example: "Web Development | UI/UX Design",
    note: "Daftar layanan yang digunakan pada proyek ini, dipisah tanda | (pipe). Boleh dikosongkan.",
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

export function downloadProjectImportTemplate() {
  const exampleRow = Object.fromEntries(PROJECT_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  exportImportTemplate("template-import-case-study", PROJECT_TEMPLATE_COLUMNS, [exampleRow]);
}
