import type { Story } from "@/lib/cms/stories";
import type { StoryInput } from "@/app/admin/(dashboard)/stories/actions";
import { exportImportTemplate, type TemplateColumn } from "@/lib/excel";

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

const STORY_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Slug",
    example: "peluncuran-produk-baru",
    note: "Wajib diisi & unik antar story. Huruf kecil, angka, dan strip saja (tanpa spasi), contoh: peluncuran-produk-baru. Ini dipakai di URL halaman story.",
  },
  {
    header: "Judul",
    example: "Peluncuran Produk Baru",
    note: "Wajib diisi. Judul story yang tampil di website.",
  },
  {
    header: "Label",
    example: "Berita",
    note: "Label kategori story, contoh: Berita, Event, Tips.",
  },
  {
    header: "Warna Label",
    example: "blue",
    note: "Isi salah satu: blue atau yellow.",
  },
  {
    header: "Deskripsi",
    example: "Kami dengan bangga memperkenalkan produk terbaru kami.",
    note: "Ringkasan 1-2 kalimat, tampil di daftar/kartu story.",
  },
  {
    header: "Isi",
    example: "Paragraf pertama isi story.\n\nParagraf kedua isi story.",
    note: "Isi lengkap story. Pisahkan tiap paragraf dengan baris kosong.",
  },
  {
    header: "Gambar",
    example: "https://contoh-domain.com/storage/stories/gambar.jpg",
    note: "Wajib diisi. Link gambar utama story. Upload gambar lewat form Tambah/Edit Story terlebih dahulu untuk mendapatkan link-nya, lalu tempel link itu di sini.",
  },
  {
    header: "Penulis",
    example: "Tim Eleven Digital",
    note: "Nama penulis story. Boleh dikosongkan.",
  },
  {
    header: "Foto Penulis",
    example: "",
    note: "Link foto penulis. Boleh dikosongkan.",
  },
  {
    header: "Tanggal",
    example: "2026-07-27",
    note: "Format tanggal YYYY-MM-DD, contoh: 2026-07-27. Boleh dikosongkan (default tanggal hari ini).",
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

export function downloadStoryImportTemplate() {
  const exampleRow = Object.fromEntries(STORY_TEMPLATE_COLUMNS.map((c) => [c.header, c.example]));
  exportImportTemplate("template-import-story", STORY_TEMPLATE_COLUMNS, [exampleRow]);
}
