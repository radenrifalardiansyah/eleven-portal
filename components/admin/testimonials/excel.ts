import type { TestimonialClient } from "@/lib/cms/testimonials";
import type { TestimonialClientInput } from "@/app/admin/(dashboard)/testimonials/actions";
import { exportImportTemplate, type TemplateColumn } from "@/lib/excel";

export function testimonialClientToExcelRow(c: TestimonialClient) {
  return {
    Slug: c.slug,
    Nama: c.name,
    Logo: c.logo,
    Industri: c.industry,
    Website: c.website,
    "Deskripsi Perusahaan": c.description,
    "Nama PIC": c.contact_name,
    "Jabatan PIC": c.contact_position,
    "Email PIC": c.contact_email,
    "Telepon PIC": c.contact_phone,
    "Kutipan Testimoni": c.testimonial_quote,
    "Pemberi Testimoni": c.testimonial_author,
    Rating: c.testimonial_rating ?? "",
    Status: c.status,
    Urutan: c.sort_order,
  };
}

export function excelRowToTestimonialClientInput(row: Record<string, string>): TestimonialClientInput | null {
  const slug = row["Slug"]?.trim();
  const name = row["Nama"]?.trim();
  if (!slug || !name) return null;

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  const rawRating = Number(row["Rating"]);
  const testimonial_rating = rawRating >= 1 && rawRating <= 5 ? rawRating : null;

  return {
    slug,
    name,
    logo: row["Logo"]?.trim() ?? "",
    industry: row["Industri"]?.trim() ?? "",
    website: row["Website"]?.trim() ?? "",
    description: row["Deskripsi Perusahaan"]?.trim() ?? "",
    contact_name: row["Nama PIC"]?.trim() ?? "",
    contact_position: row["Jabatan PIC"]?.trim() ?? "",
    contact_email: row["Email PIC"]?.trim() ?? "",
    contact_phone: row["Telepon PIC"]?.trim() ?? "",
    testimonial_quote: row["Kutipan Testimoni"]?.trim() ?? "",
    testimonial_author: row["Pemberi Testimoni"]?.trim() ?? "",
    testimonial_rating,
    status,
    sort_order: Number(row["Urutan"]) || 0,
  };
}

const TESTIMONIAL_CLIENT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Slug",
    example: "pt-abc-indonesia",
    note: "Wajib diisi & unik antar klien. Huruf kecil, angka, dan strip saja (tanpa spasi), contoh: pt-abc-indonesia.",
  },
  {
    header: "Nama",
    example: "PT ABC Indonesia",
    note: "Wajib diisi. Nama klien yang tampil di website.",
  },
  {
    header: "Logo",
    example: "https://contoh-domain.com/storage/testimonials/logo.png",
    note: "Wajib diisi. Link logo klien. Upload gambar lewat form Tambah/Edit Klien terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini.",
  },
  {
    header: "Industri",
    example: "Perbankan",
    note: "Industri/kategori bisnis klien, contoh: Perbankan, F&B, Manufaktur. Boleh dikosongkan.",
  },
  {
    header: "Website",
    example: "https://abc-indonesia.com",
    note: "Link website perusahaan klien. Boleh dikosongkan.",
  },
  {
    header: "Deskripsi Perusahaan",
    example: "Perusahaan distribusi consumer goods dengan jaringan nasional.",
    note: "Deskripsi singkat perusahaan klien. Boleh dikosongkan.",
  },
  {
    header: "Nama PIC",
    example: "Andi Wijaya",
    note: "Nama contact person di perusahaan klien. Boleh dikosongkan.",
  },
  {
    header: "Jabatan PIC",
    example: "Marketing Manager",
    note: "Jabatan contact person. Boleh dikosongkan.",
  },
  {
    header: "Email PIC",
    example: "andi@abc-indonesia.com",
    note: "Email contact person. Boleh dikosongkan.",
  },
  {
    header: "Telepon PIC",
    example: "081234567890",
    note: "No. telepon/WhatsApp contact person. Boleh dikosongkan.",
  },
  {
    header: "Kutipan Testimoni",
    example: "Tim Eleven Digital sangat responsif dan hasil kerjanya melebihi ekspektasi kami.",
    note: "Kutipan testimoni dari klien. Boleh dikosongkan.",
  },
  {
    header: "Pemberi Testimoni",
    example: "Andi Wijaya",
    note: "Nama yang tercantum sebagai pemberi testimoni (boleh sama dengan Nama PIC). Boleh dikosongkan.",
  },
  {
    header: "Rating",
    example: "5",
    note: "Angka 1 sampai 5. Boleh dikosongkan jika tidak ada rating.",
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

export function downloadTestimonialClientImportTemplate() {
  const exampleRow = Object.fromEntries(TESTIMONIAL_CLIENT_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  exportImportTemplate("template-import-klien", TESTIMONIAL_CLIENT_TEMPLATE_COLUMNS, [exampleRow]);
}
