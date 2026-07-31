"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, Link2, Check, ImageOff } from "lucide-react";
import { updatePageSectionContent } from "@/app/admin/(dashboard)/page-sections/actions";
import { uploadMediaFile } from "@/lib/supabase/upload";
import { isVideoUrl } from "@/lib/media";
import type { PageSectionRow } from "@/lib/cms/page-sections";

const FIELD_META: Record<string, { label: string; multiline?: boolean; image?: boolean; placeholder?: string }> = {
  eyebrow: { label: "Eyebrow (label kecil)" },
  title: { label: "Judul" },
  title_prefix: { label: "Judul (awal)" },
  title_highlight: { label: "Judul (bagian disorot)" },
  title_suffix: { label: "Judul (akhir)" },
  description: { label: "Deskripsi", multiline: true },
  cta_label: { label: "Teks Tombol" },
  cta_href: { label: "Link Tombol", placeholder: "#services atau https://..." },
  secondary_label: { label: "Teks Tombol Kedua" },
  secondary_href: { label: "Link Tombol Kedua" },
  submit_label: { label: "Teks Tombol Kirim" },
  image: { label: "Gambar", image: true },
};

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

export default function PageSectionForm({
  section,
  onSuccess,
  onCancel,
}: {
  section: PageSectionRow;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({ ...section.content });
  const [submitting, setSubmitting] = useState(false);

  const fields = Object.keys(section.content);

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePageSectionContent(section.page_key, section.section_key, values);
      toast.success("Konten berhasil disimpan");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan konten");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.length === 0 && <p className="text-sm text-ink-500">Section ini belum punya konten.</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map((key) => {
          const meta = FIELD_META[key] ?? { label: key };
          if (meta.image) {
            // Only the Hero illustration doubles as a video background — About/Contact
            // still render through next/image, which can't play a <video> source.
            const allowVideo = section.section_key === "hero";
            return (
              <div key={key} className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-ink-700">
                  {allowVideo ? "Gambar / Video" : meta.label}
                </label>
                <ImageField value={values[key] ?? ""} onChange={(url) => setField(key, url)} allowVideo={allowVideo} />
              </div>
            );
          }
          return (
            <div key={key} className={`space-y-1.5 ${meta.multiline ? "sm:col-span-2" : ""}`}>
              <label className="text-sm font-medium text-ink-700">{meta.label}</label>
              {meta.multiline ? (
                <textarea
                  value={values[key] ?? ""}
                  onChange={(e) => setField(key, e.target.value)}
                  rows={3}
                  placeholder={meta.placeholder}
                  className={inputClass}
                />
              ) : (
                <input
                  value={values[key] ?? ""}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={meta.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan
        </button>
      </div>
    </form>
  );
}

function ImageField({
  value,
  onChange,
  allowVideo,
}: {
  value: string;
  onChange: (url: string) => void;
  allowVideo?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valueIsVideo = isVideoUrl(value);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadMediaFile(file, "page-sections");
      onChange(url);
      setLinkValue(url);
      toast.success(allowVideo ? "Media diperbarui" : "Gambar diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah media");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink-900/10 bg-ink-900/[0.02]">
          {value && valueIsVideo ? (
            <video src={value} muted loop autoPlay playsInline className="h-full w-full object-contain" />
          ) : value ? (
            <Image src={value} alt="" width={64} height={64} unoptimized className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="h-5 w-5 text-ink-900/30" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-brand-blue/10 px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/20 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
        <button
          type="button"
          onClick={() => setLinkMode((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-900/5"
        >
          <Link2 className="h-4 w-4" />
          Pakai Link
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={allowVideo ? "image/*,video/*" : "image/*"}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {allowVideo && (
        <p className="text-xs text-ink-500">Bisa upload gambar atau video (mp4/webm) untuk ilustrasi hero.</p>
      )}
      {linkMode && (
        <div className="flex gap-2">
          <input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="/images/... atau https://..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              onChange(linkValue);
              setLinkMode(false);
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-light"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
