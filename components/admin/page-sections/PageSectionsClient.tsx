"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import Modal from "@/components/admin/Modal";
import PageSectionForm from "@/components/admin/page-sections/PageSectionForm";
import type { PageSectionRow } from "@/lib/cms/page-sections";

// Fixed order matches the homepage's actual top-to-bottom layout, so admins
// scan the list in the same order they'd scroll the site.
const SECTION_ORDER = [
  "hero",
  "about",
  "services_header",
  "products_header",
  "team_header",
  "stories_header",
  "casestudy_header",
  "testimonials_header",
  "testimonial_quotes_header",
  "contact",
];

const SECTION_META: Record<string, { label: string; description: string }> = {
  hero: { label: "Hero", description: "Bagian paling atas homepage." },
  about: { label: "Tentang Kami", description: 'Bagian "Kenapa Memilih Eleven Digital Indonesia".' },
  services_header: { label: "Header Layanan", description: "Judul & deskripsi di atas daftar layanan." },
  products_header: { label: "Header Produk", description: "Judul & deskripsi di atas daftar produk." },
  team_header: { label: "Header Tim", description: "Judul & deskripsi di atas daftar anggota tim." },
  stories_header: { label: "Header Stories", description: "Judul & deskripsi di atas daftar stories." },
  casestudy_header: { label: "Header Case Study", description: "Judul & deskripsi di atas daftar proyek." },
  testimonials_header: { label: "Header Client Logos", description: "Judul & deskripsi di atas logo klien." },
  testimonial_quotes_header: { label: "Header Testimoni", description: "Judul & deskripsi di atas kutipan testimoni." },
  contact: { label: "Kontak", description: "Bagian formulir kontak di bagian bawah homepage." },
};

export default function PageSectionsClient({
  sections,
  canEdit,
}: {
  sections: PageSectionRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<PageSectionRow | null>(null);

  const sorted = [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.section_key);
    const bi = SECTION_ORDER.indexOf(b.section_key);
    if (ai === -1 && bi === -1) return a.section_key.localeCompare(b.section_key);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  function handleSuccess() {
    setEditing(null);
    router.refresh();
  }

  const editingMeta = editing ? SECTION_META[editing.section_key] : undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((section) => {
          const meta = SECTION_META[section.section_key] ?? {
            label: section.section_key,
            description: "Konten section homepage.",
          };
          const preview = section.content.title || section.content.eyebrow || "-";
          return (
            <div key={section.id} className="flex flex-col rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
              <p className="font-heading text-sm font-semibold text-ink-900">{meta.label}</p>
              <p className="mt-1 text-xs text-ink-500">{meta.description}</p>
              <p className="mt-3 truncate text-sm text-ink-700">{preview}</p>
              {canEdit && (
                <button
                  onClick={() => setEditing(section)}
                  className="mt-4 flex w-fit items-center justify-center gap-2 rounded-lg border border-ink-900/10 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-ink-500">Tidak ada data.</p>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editingMeta?.label ?? editing?.section_key ?? ""}
        description={editingMeta?.description}
      >
        {editing && <PageSectionForm key={editing.id} section={editing} onSuccess={handleSuccess} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
