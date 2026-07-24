"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, Link2, Clock, User, Lock, Settings, Check, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatarFile } from "@/lib/supabase/upload";
import {
  updateOwnProfile,
  updateAvatarUrl,
  updateThemePreference,
  type ProfileUpdateInput,
} from "@/app/admin/(dashboard)/profile/actions";

type Tab = "profil" | "keamanan" | "sistem";
type Theme = "light" | "dark" | "system";
type LoginHistoryEntry = { id: string; createdAt: string; device: string };

const inputClass =
  "w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";
const disabledInputClass = "w-full rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2.5 text-sm text-ink-500";

function formatLastSignIn(iso: string | null) {
  if (!iso) return "Belum ada data";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProfileForm({
  userId,
  email,
  roleLabel,
  initialFullName,
  initialAvatarUrl,
  initialPhone,
  initialPosition,
  initialBio,
  initialTheme,
  lastSignInAt,
  loginHistory,
}: {
  userId: string;
  email: string;
  roleLabel: string;
  initialFullName: string;
  initialAvatarUrl: string;
  initialPhone: string;
  initialPosition: string;
  initialBio: string;
  initialTheme: string;
  lastSignInAt: string | null;
  loginHistory: LoginHistoryEntry[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profil");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-ink-900/10 bg-white p-1.5">
        {(
          [
            { key: "profil", label: "Profil", icon: User },
            { key: "keamanan", label: "Keamanan", icon: Lock },
            { key: "sistem", label: "Sistem", icon: Settings },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "profil" && (
        <ProfilTab
          userId={userId}
          email={email}
          roleLabel={roleLabel}
          initialFullName={initialFullName}
          initialAvatarUrl={initialAvatarUrl}
          initialPhone={initialPhone}
          initialPosition={initialPosition}
          initialBio={initialBio}
          lastSignInAt={lastSignInAt}
          loginHistory={loginHistory}
          onAvatarChanged={() => router.refresh()}
        />
      )}
      {tab === "keamanan" && <KeamananTab email={email} />}
      {tab === "sistem" && <SistemTab initialTheme={initialTheme} />}
    </div>
  );
}

function ProfilTab({
  userId,
  email,
  roleLabel,
  initialFullName,
  initialAvatarUrl,
  initialPhone,
  initialPosition,
  initialBio,
  lastSignInAt,
  loginHistory,
  onAvatarChanged,
}: {
  userId: string;
  email: string;
  roleLabel: string;
  initialFullName: string;
  initialAvatarUrl: string;
  initialPhone: string;
  initialPosition: string;
  initialBio: string;
  lastSignInAt: string | null;
  loginHistory: LoginHistoryEntry[];
  onAvatarChanged: () => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState(initialAvatarUrl);
  const [savingLink, setSavingLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [position, setPosition] = useState(initialPosition);
  const [bio, setBio] = useState(initialBio);
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleFile(file: File) {
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatarFile(file, userId);
      await updateAvatarUrl(url);
      setAvatarUrl(url);
      setLinkValue(url);
      toast.success("Foto profil diperbarui");
      onAvatarChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveLink() {
    setSavingLink(true);
    try {
      await updateAvatarUrl(linkValue);
      setAvatarUrl(linkValue);
      setLinkMode(false);
      toast.success("Foto profil diperbarui");
      onAvatarChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan link foto");
    } finally {
      setSavingLink(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const input: ProfileUpdateInput = { fullName, phone, position, bio };
      await updateOwnProfile(input);
      toast.success("Profil berhasil diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6">
        <div>
          <h2 className="font-heading text-base font-semibold text-ink-900">Foto Profil</h2>
          <p className="text-sm text-ink-500">Foto ini akan tampil di sidebar dan header admin</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-blue-light text-lg font-semibold text-white">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" unoptimized />
            ) : (
              (fullName || email || "?").charAt(0).toUpperCase()
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

      <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6">
        <div>
          <h2 className="font-heading text-base font-semibold text-ink-900">Informasi Akun</h2>
          <p className="text-sm text-ink-500">Detail identitas yang digunakan pada portal admin</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Nama Lengkap</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Email</label>
            <input value={email} disabled className={disabledInputClass} />
            <p className="text-xs text-ink-500">Email digunakan sebagai ID akun dan tidak dapat diubah</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">No. Telepon</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Jabatan / Posisi</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="cth. Content Manager"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Bio / Tentang</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Deskripsi singkat tentang Anda"
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Role</label>
            <input value={roleLabel} disabled className={disabledInputClass} />
            <p className="text-xs text-ink-500">Role akun ditentukan oleh administrator sistem</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Login Terakhir</label>
            <div className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2.5 text-sm text-ink-500">
              <Clock className="h-4 w-4 shrink-0" />
              {formatLastSignIn(loginHistory[0]?.createdAt ?? lastSignInAt)}
              {loginHistory[0] && ` · ${loginHistory[0].device}`}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
          >
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan Profil
          </button>
        </div>
      </form>

      <div className="space-y-3 rounded-2xl border border-ink-900/5 bg-white p-6">
        <h2 className="font-heading text-base font-semibold text-ink-900">Riwayat Login (7 Hari Terakhir)</h2>

        {loginHistory.length === 0 ? (
          <p className="text-sm text-ink-500">Belum ada riwayat login.</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {loginHistory.map((entry) => {
              const DeviceIcon = entry.device === "Mobile" || entry.device === "Tablet" ? Smartphone : Monitor;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-ink-900/[0.02] px-3 py-2.5 text-sm text-ink-500"
                >
                  <DeviceIcon className="h-4 w-4 shrink-0" />
                  {formatLastSignIn(entry.createdAt)} · {entry.device}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-ink-500">
          Riwayat mulai tercatat sejak fitur ini aktif — login sebelumnya tidak tersimpan.
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-10`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function KeamananTab({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Masukkan password saat ini");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) throw new Error("Password saat ini salah");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6">
      <div>
        <h2 className="font-heading text-base font-semibold text-ink-900">Ubah Password</h2>
        <p className="text-sm text-ink-500">Gunakan password yang kuat dan tidak digunakan di tempat lain</p>
      </div>

      <PasswordField
        label="Password Saat Ini"
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Masukkan password saat ini"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PasswordField
          label="Password Baru"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Minimal 6 karakter"
        />
        <PasswordField
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Ulangi password baru"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={savingPassword}
          className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
          Ubah Password
        </button>
      </div>
    </form>
  );
}

const THEME_OPTIONS: { key: Theme; label: string }[] = [
  { key: "light", label: "Terang" },
  { key: "dark", label: "Gelap" },
  { key: "system", label: "Ikuti Sistem" },
];

function SistemTab({ initialTheme }: { initialTheme: string }) {
  const [theme, setTheme] = useState<Theme>((initialTheme as Theme) ?? "system");
  const [saving, setSaving] = useState(false);

  async function handleSelect(next: Theme) {
    setTheme(next);
    setSaving(true);
    try {
      await updateThemePreference(next);
      toast.success("Preferensi tema disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan preferensi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6">
      <div>
        <h2 className="font-heading text-base font-semibold text-ink-900">Preferensi Tampilan</h2>
        <p className="text-sm text-ink-500">Pilihan tema disimpan ke akun Anda</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            disabled={saving}
            onClick={() => handleSelect(opt.key)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
              theme === opt.key
                ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                : "border-ink-900/10 text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            {theme === opt.key && <Check className="h-4 w-4" />}
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-500">
        Catatan: tampilan admin saat ini belum mendukung mode gelap secara visual — preferensi ini tersimpan untuk
        dipakai begitu dark mode benar-benar diterapkan.
      </p>
    </div>
  );
}
