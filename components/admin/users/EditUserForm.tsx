"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, Link2, Check } from "lucide-react";
import { updateUserProfile, updateUserAvatarUrl, uploadUserAvatar } from "@/app/admin/(dashboard)/users/actions";
import type { AdminUser } from "@/lib/cms/users";

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";
const disabledInputClass = "w-full rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2.5 text-sm text-ink-500";

export default function EditUserForm({ user, onSuccess }: { user: AdminUser; onSuccess?: () => void }) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState(user.avatarUrl ?? "");
  const [savingLink, setSavingLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [position, setPosition] = useState(user.position ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const url = await uploadUserAvatar(user.id, formData);
      setAvatarUrl(url);
      setLinkValue(url);
      toast.success("Foto profil diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveLink() {
    setSavingLink(true);
    try {
      await updateUserAvatarUrl(user.id, linkValue);
      setAvatarUrl(linkValue);
      setLinkMode(false);
      toast.success("Foto profil diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan link foto");
    } finally {
      setSavingLink(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(user.id, { fullName, phone, position, bio });
      toast.success("Data pengguna berhasil disimpan");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan data pengguna");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-ink-700">Foto Profil</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-blue-light text-lg font-semibold text-white">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" unoptimized />
            ) : (
              (fullName || user.email || "?").charAt(0).toUpperCase()
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="flex items-center gap-2 rounded-xl bg-brand-blue/10 px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/20 disabled:opacity-60"
          >
            {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Ganti Foto
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
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {linkMode && (
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
              disabled={savingLink}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-light disabled:opacity-60"
            >
              {savingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
          </div>
        )}

        <p className="text-xs text-ink-500">JPG atau PNG, disarankan rasio 1:1</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama Lengkap">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email">
          <input value={user.email ?? ""} disabled className={disabledInputClass} />
        </Field>
        <Field label="No. Telepon">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className={inputClass}
          />
        </Field>
        <Field label="Jabatan / Posisi">
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="cth. Content Manager"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Bio / Tentang">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Deskripsi singkat tentang pengguna"
          rows={3}
          className={inputClass}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      {children}
    </div>
  );
}
