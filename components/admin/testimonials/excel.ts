import type { TestimonialClient } from "@/lib/cms/testimonials";
import type { TestimonialClientInput } from "@/app/admin/(dashboard)/testimonials/actions";

export function testimonialClientToExcelRow(c: TestimonialClient) {
  return {
    Slug: c.slug,
    Nama: c.name,
    Logo: c.logo,
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

  return {
    slug,
    name,
    logo: row["Logo"]?.trim() ?? "",
    status,
    sort_order: Number(row["Urutan"]) || 0,
  };
}
