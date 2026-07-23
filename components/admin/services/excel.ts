import type { Service } from "@/lib/cms/services";
import type { ServiceInput } from "@/app/admin/(dashboard)/services/actions";

export function serviceToExcelRow(s: Service) {
  return {
    Slug: s.slug,
    Judul: s.title,
    "Deskripsi Singkat": s.description,
    "Deskripsi Lengkap": s.long_description,
    Benefit: s.benefits.join(" | "),
    Ikon: s.icon,
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
