import type { Service } from "@/lib/cms/services";
import type { ServiceInput } from "@/app/admin/(dashboard)/services/actions";
import { exportImportTemplate, type TemplateColumn } from "@/lib/excel";

export function serviceToExcelRow(s: Service) {
  return {
    Slug: s.slug,
    Judul: s.title,
    "Deskripsi Singkat": s.description,
    "Deskripsi Lengkap": s.long_description,
    Benefit: s.benefits.join(" | "),
    Ikon: s.icon,
    Galeri: s.gallery.join(" | "),
    Status: s.status,
    Urutan: s.sort_order,
  };
}

export function excelRowToServiceInput(row: Record<string, string>): ServiceInput | null {
  const slug = row["Slug"]?.trim();
  const title = row["Judul"]?.trim();
  if (!slug || !title) return null;

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    title,
    description: row["Deskripsi Singkat"]?.trim() ?? "",
    long_description: row["Deskripsi Lengkap"]?.trim() ?? "",
    benefits: splitList(row["Benefit"]),
    icon: row["Ikon"]?.trim() ?? "",
    gallery: splitList(row["Galeri"]),
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

const SERVICE_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Slug",
    example: "pengembangan-web",
    note: "Wajib diisi & unik antar layanan. Huruf kecil, angka, dan strip saja (tanpa spasi), contoh: pengembangan-web. Ini dipakai di URL halaman layanan.",
  },
  {
    header: "Judul",
    example: "Pengembangan Web",
    note: "Wajib diisi. Nama layanan yang tampil di website.",
  },
  {
    header: "Deskripsi Singkat",
    example: "Membangun website modern, cepat, dan responsif untuk bisnis Anda.",
    note: "Ringkasan 1-2 kalimat, tampil di daftar/kartu layanan.",
  },
  {
    header: "Deskripsi Lengkap",
    example: "Layanan pengembangan website mulai dari company profile hingga aplikasi web kustom, dengan teknologi terkini.",
    note: "Deskripsi detail, tampil di halaman detail layanan.",
  },
  {
    header: "Benefit",
    example: "Desain Custom | SEO Friendly | Support 24 Jam",
    note: "Daftar benefit dipisah tanda | (pipe). Contoh: Benefit A | Benefit B | Benefit C. Boleh dikosongkan.",
  },
  {
    header: "Ikon",
    example: "https://contoh-domain.com/storage/services/ikon.svg",
    note: "Link ikon layanan. Upload gambar lewat form Tambah/Edit Layanan terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini. Boleh dikosongkan.",
  },
  {
    header: "Galeri",
    example: "",
    note: "Link gambar galeri tambahan, dipisah tanda | (pipe) jika lebih dari satu. Boleh dikosongkan.",
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

export function downloadServiceImportTemplate() {
  const exampleRow = Object.fromEntries(SERVICE_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  exportImportTemplate("template-import-layanan", SERVICE_TEMPLATE_COLUMNS, [exampleRow]);
}
