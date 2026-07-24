"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload, Link2, Check, Instagram, Linkedin, Youtube } from "lucide-react";
import { uploadMediaFile } from "@/lib/supabase/upload";
import TiktokIcon from "@/components/ui/TiktokIcon";
import {
  updateBranding,
  updateCompanySettings,
  updateContactSettings,
  updateSocialLinks,
  updateCopyright,
} from "@/app/admin/(dashboard)/site-settings/actions";
import type { SiteBranding, SiteCompany, SiteContact, SiteCopyright, SiteSocialLinks } from "@/lib/cms/public-site-settings";

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-ink-900/[0.03] disabled:text-ink-500";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6">
      <div>
        <h2 className="font-heading text-base font-semibold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function SiteSettingsForm({
  initialBranding,
  initialCompany,
  initialContact,
  initialSocialLinks,
  initialCopyright,
  canEdit,
}: {
  initialBranding: SiteBranding;
  initialCompany: SiteCompany;
  initialContact: SiteContact;
  initialSocialLinks: SiteSocialLinks;
  initialCopyright: SiteCopyright;
  canEdit: boolean;
}) {
  const [branding, setBranding] = useState(initialBranding);
  const [company, setCompany] = useState(initialCompany);
  const [contact, setContact] = useState(initialContact);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [copyright, setCopyright] = useState(initialCopyright);
  const [saving, setSaving] = useState(false);

  async function handleSaveAll() {
    setSaving(true);
    try {
      await Promise.all([
        updateCompanySettings(company),
        updateContactSettings(contact),
        updateSocialLinks(socialLinks),
        updateCopyright(copyright),
      ]);
      toast.success("Pengaturan situs berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 pb-20">
      <LogoFaviconSection branding={branding} onSaved={setBranding} canEdit={canEdit} />

      <SectionCard title="Identitas Perusahaan" description="Nama dan tagline yang tampil di website">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Nama Resmi (PT)</label>
            <input
              value={company.legalName}
              onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Nama Singkat / Brand</label>
            <input
              value={company.brandName}
              onChange={(e) => setCompany({ ...company, brandName: e.target.value })}
              disabled={!canEdit}
              className={inputClass}
            />
            <p className="text-xs text-ink-500">Ditampilkan sebagai teks alternatif logo</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Tagline / Deskripsi Singkat</label>
          <textarea
            value={company.tagline}
            onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
            rows={2}
            disabled={!canEdit}
            className={inputClass}
          />
          <p className="text-xs text-ink-500">Muncul di footer website</p>
        </div>
      </SectionCard>

      <SectionCard
        title="Kontak & Alamat"
        description="Ditampilkan di footer, tombol WhatsApp produk/layanan, dan data terstruktur (JSON-LD) situs"
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Alamat</label>
          <input
            value={contact.address.streetAddress}
            onChange={(e) => setContact({ ...contact, address: { ...contact.address, streetAddress: e.target.value } })}
            disabled={!canEdit}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Kota</label>
            <input
              value={contact.address.addressLocality}
              onChange={(e) =>
                setContact({ ...contact, address: { ...contact.address, addressLocality: e.target.value } })
              }
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Provinsi</label>
            <input
              value={contact.address.addressRegion}
              onChange={(e) =>
                setContact({ ...contact, address: { ...contact.address, addressRegion: e.target.value } })
              }
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Kode Negara</label>
            <input
              value={contact.address.addressCountry}
              onChange={(e) =>
                setContact({ ...contact, address: { ...contact.address, addressCountry: e.target.value } })
              }
              placeholder="ID"
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Email</label>
            <input
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="hello@eleven-digital.id"
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">No. Telepon</label>
            <input
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="+62877234999550"
              disabled={!canEdit}
              className={inputClass}
            />
            <p className="text-xs text-ink-500">Format angka saja dengan kode negara, cth. 62877234999550</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Nomor WhatsApp</label>
          <input
            value={contact.whatsapp}
            onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
            placeholder="62877234999550"
            disabled={!canEdit}
            className={inputClass}
          />
          <p className="text-xs text-ink-500">
            Digunakan untuk tombol WA di footer dan halaman produk/layanan. Format angka saja dengan kode negara,
            cth. 62877234999550
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Media Sosial" description="Tautan yang tampil sebagai ikon di footer website">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </label>
            <input
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              placeholder="https://instagram.com/namaperusahaan"
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </label>
            <input
              value={socialLinks.linkedin}
              onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/namaperusahaan"
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <TiktokIcon className="h-3.5 w-3.5" /> TikTok
            </label>
            <input
              value={socialLinks.tiktok}
              onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
              placeholder="https://www.tiktok.com/@namaperusahaan"
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <Youtube className="h-3.5 w-3.5" /> YouTube
            </label>
            <input
              value={socialLinks.youtube}
              onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              placeholder="https://youtube.com/@namaperusahaan"
              disabled={!canEdit}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Copyright" description="Teks yang tampil di bagian bawah footer website">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Teks Copyright</label>
          <input
            value={copyright.text}
            onChange={(e) => setCopyright({ text: e.target.value })}
            placeholder="PT. Nama Perusahaan - All rights reserved."
            disabled={!canEdit}
            className={inputClass}
          />
        </div>
      </SectionCard>

      {canEdit && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Simpan
          </button>
        </div>
      )}
    </div>
  );
}

function LogoSlot({
  label,
  hint,
  value,
  onUploaded,
  canEdit,
}: {
  label: string;
  hint: string;
  value: string;
  onUploaded: (url: string) => Promise<void>;
  canEdit: boolean;
}) {
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState(value);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const url = await uploadMediaFile(file, "site-settings");
      await onUploaded(url);
      setLinkValue(url);
      toast.success(`${label} diperbarui`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Gagal mengunggah ${label.toLowerCase()}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveLink() {
    setBusy(true);
    try {
      await onUploaded(linkValue);
      setLinkMode(false);
      toast.success(`${label} diperbarui`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Gagal menyimpan ${label.toLowerCase()}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <p className="mt-1 text-xs text-ink-500">{hint}</p>
      </div>

      {canEdit && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLinkMode(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              !linkMode ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setLinkMode(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              linkMode ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            Pakai Link
          </button>
        </div>
      )}

      <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-ink-900/15 bg-ink-900/[0.02] p-3">
        {value ? (
          <Image src={value} alt={label} width={160} height={90} className="max-h-full w-auto object-contain" unoptimized />
        ) : (
          <span className="text-xs text-ink-400">Belum ada {label.toLowerCase()}</span>
        )}
      </div>

      {canEdit && !linkMode && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue/10 px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/20 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload File
        </button>
      )}
      {canEdit && linkMode && (
        <div className="flex gap-2">
          <input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleSaveLink}
            disabled={busy}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-light disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <Link2 className="h-3 w-3" />
        JPG, PNG, WebP, atau GIF, maks 5MB
      </p>
    </div>
  );
}

function LogoFaviconSection({
  branding,
  onSaved,
  canEdit,
}: {
  branding: SiteBranding;
  onSaved: (branding: SiteBranding) => void;
  canEdit: boolean;
}) {
  async function save(patch: Partial<SiteBranding>) {
    const next = { ...branding, ...patch };
    await updateBranding(next);
    onSaved(next);
  }

  return (
    <SectionCard title="Logo & Favicon" description="Digunakan di navbar, footer website, sidebar admin, dan ikon tab browser">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <LogoSlot
          label="Logo Perusahaan"
          hint="Tampil di navbar & footer website. Gunakan PNG transparan, boleh memanjang (tidak harus persegi)."
          value={branding.logoUrl}
          onUploaded={(url) => save({ logoUrl: url })}
          canEdit={canEdit}
        />
        <LogoSlot
          label="Logo Admin"
          hint="Tampil di sidebar & topbar halaman admin. Kosongkan untuk memakai Logo Perusahaan."
          value={branding.adminLogoUrl}
          onUploaded={(url) => save({ adminLogoUrl: url })}
          canEdit={canEdit}
        />
        <LogoSlot
          label="Favicon"
          hint="Ikon tab browser. PNG persegi, background solid (bukan transparan) agar terbaca di tab gelap/terang."
          value={branding.faviconUrl}
          onUploaded={(url) => save({ faviconUrl: url })}
          canEdit={canEdit}
        />
      </div>
    </SectionCard>
  );
}
