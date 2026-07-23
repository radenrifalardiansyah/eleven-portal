import type { Project } from "@/lib/cms/projects";
import type { ProjectInput } from "@/app/admin/(dashboard)/projects/actions";

export function projectToExcelRow(p: Project) {
  return {
    Slug: p.slug,
    Judul: p.title,
    Kategori: p.category,
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

export function excelRowToProjectInput(row: Record<string, string>): ProjectInput | null {
  const slug = row["Slug"]?.trim();
  const title = row["Judul"]?.trim();
  if (!slug || !title) return null;

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    title,
    category: row["Kategori"]?.trim() ?? "",
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
