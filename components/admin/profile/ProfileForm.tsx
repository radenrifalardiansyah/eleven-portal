"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateOwnProfile } from "@/app/admin/(dashboard)/profile/actions";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export default function ProfileForm({
  email,
  role,
  initialFullName,
}: {
  email: string;
  role: string;
  initialFullName: string;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateOwnProfile(fullName);
      toast.success("Profil berhasil diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password berhasil diubah");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form
        onSubmit={handleProfileSubmit}
        className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6"
      >
        <h2 className="font-heading text-base font-semibold text-ink-900">Informasi Akun</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Email</label>
            <input
              value={email}
              disabled
              className="w-full rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2.5 text-sm text-ink-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Role</label>
            <input
              value={ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
              disabled
              className="w-full rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2.5 text-sm text-ink-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Nama Lengkap</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
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

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl border border-ink-900/5 bg-white p-6"
      >
        <h2 className="font-heading text-base font-semibold text-ink-900">Ubah Password</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-700">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
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
    </div>
  );
}
