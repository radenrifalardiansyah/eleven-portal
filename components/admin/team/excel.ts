import type { TeamMember } from "@/lib/cms/team";
import type { TeamMemberInput } from "@/app/admin/(dashboard)/team/actions";
import { exportImportTemplate, type TemplateColumn } from "@/lib/excel";

export function teamMemberToExcelRow(m: TeamMember) {
  return {
    Slug: m.slug,
    Nama: m.name,
    Jabatan: m.position,
    "Bio Singkat": m.bio,
    "Bio Lengkap": m.long_bio,
    Email: m.email,
    Foto: m.photo_url ?? "",
    Instagram: m.socials?.instagram ?? "",
    Facebook: m.socials?.facebook ?? "",
    Twitter: m.socials?.twitter ?? "",
    Status: m.status,
    Urutan: m.sort_order,
  };
}

export function excelRowToTeamMemberInput(row: Record<string, string>): TeamMemberInput | null {
  const slug = row["Slug"]?.trim();
  const name = row["Nama"]?.trim();
  if (!slug || !name) return null;

  const socials: TeamMemberInput["socials"] = {};
  if (row["Instagram"]?.trim()) socials.instagram = row["Instagram"].trim();
  if (row["Facebook"]?.trim()) socials.facebook = row["Facebook"].trim();
  if (row["Twitter"]?.trim()) socials.twitter = row["Twitter"].trim();

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    name,
    position: row["Jabatan"]?.trim() ?? "",
    bio: row["Bio Singkat"]?.trim() ?? "",
    long_bio: row["Bio Lengkap"]?.trim() ?? "",
    email: row["Email"]?.trim() ?? "",
    photo_url: row["Foto"]?.trim() || null,
    socials,
    status,
    sort_order: Number(row["Urutan"]) || 0,
  };
}

const TEAM_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Slug",
    example: "budi-santoso",
    note: "Wajib diisi & unik antar anggota tim. Huruf kecil, angka, dan strip saja (tanpa spasi), contoh: budi-santoso. Ini dipakai di URL halaman anggota tim.",
  },
  {
    header: "Nama",
    example: "Budi Santoso",
    note: "Wajib diisi. Nama anggota tim yang tampil di website.",
  },
  {
    header: "Jabatan",
    example: "Lead Developer",
    note: "Jabatan/posisi anggota tim.",
  },
  {
    header: "Bio Singkat",
    example: "Berpengalaman lebih dari 5 tahun membangun aplikasi web.",
    note: "Ringkasan 1-2 kalimat, tampil di daftar/kartu anggota tim.",
  },
  {
    header: "Bio Lengkap",
    example: "Budi memimpin tim pengembangan dengan fokus pada arsitektur web modern dan performa aplikasi.",
    note: "Bio detail, tampil di halaman detail anggota tim.",
  },
  {
    header: "Email",
    example: "budi@elevendigital.id",
    note: "Alamat email anggota tim. Boleh dikosongkan.",
  },
  {
    header: "Foto",
    example: "https://contoh-domain.com/storage/team/foto.jpg",
    note: "Link foto anggota tim. Upload gambar lewat form Tambah/Edit Anggota terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini. Boleh dikosongkan.",
  },
  {
    header: "Instagram",
    example: "https://instagram.com/budisantoso",
    note: "Link akun Instagram. Boleh dikosongkan.",
  },
  {
    header: "Facebook",
    example: "",
    note: "Link akun Facebook. Boleh dikosongkan.",
  },
  {
    header: "Twitter",
    example: "",
    note: "Link akun Twitter/X. Boleh dikosongkan.",
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

export function downloadTeamMemberImportTemplate() {
  const exampleRow = Object.fromEntries(TEAM_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  exportImportTemplate("template-import-tim", TEAM_TEMPLATE_COLUMNS, [exampleRow]);
}
