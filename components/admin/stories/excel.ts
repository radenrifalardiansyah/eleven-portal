import type { Story } from "@/lib/cms/stories";
import type { StoryInput } from "@/app/admin/(dashboard)/stories/actions";

export function storyToExcelRow(s: Story) {
  return {
    Slug: s.slug,
    Judul: s.title,
    Label: s.label,
    "Warna Label": s.label_color,
    Deskripsi: s.description,
    Isi: s.content.join("\n\n"),
    Gambar: s.image,
    Penulis: s.author,
    "Foto Penulis": s.author_image,
    Tanggal: s.date,
    Status: s.status,
    Urutan: s.sort_order,
  };
}

export function excelRowToStoryInput(row: Record<string, string>): StoryInput | null {
  const slug = row["Slug"]?.trim();
  const title = row["Judul"]?.trim();
  if (!slug || !title) return null;

  const labelColor = row["Warna Label"]?.trim().toLowerCase() === "yellow" ? "yellow" : "blue";
  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    title,
    label: row["Label"]?.trim() ?? "",
    label_color: labelColor,
    description: row["Deskripsi"]?.trim() ?? "",
    content: (row["Isi"] ?? "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    image: row["Gambar"]?.trim() ?? "",
    author: row["Penulis"]?.trim() ?? "",
    author_image: row["Foto Penulis"]?.trim() ?? "",
    date: row["Tanggal"]?.trim() ?? new Date().toISOString().slice(0, 10),
    status,
    sort_order: Number(row["Urutan"]) || 0,
  };
}
