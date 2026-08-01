"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { recordLogin } from "@/app/admin/(auth)/login/actions";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { email?: string; password?: string };

/** Maps Supabase's raw auth error message to a clearer Indonesian message.
 *  Deliberately does NOT distinguish "email not found" from "wrong password"
 *  for "Invalid login credentials" — Supabase merges those on purpose so a
 *  failed login never reveals whether an email is registered (prevents
 *  attackers enumerating valid accounts). Other error types are safe to
 *  spell out in detail since they don't leak account existence. */
function describeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Email atau password yang Anda masukkan salah. Periksa kembali keduanya.";
  }
  if (m.includes("email not confirmed")) {
    return "Email ini belum dikonfirmasi. Hubungi admin untuk verifikasi akun Anda.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Tidak bisa terhubung ke server. Periksa koneksi internet Anda.";
  }
  return "Terjadi kesalahan saat masuk. Coba lagi.";
}

export default function LoginForm({ logoUrl, brandName }: { logoUrl: string; brandName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) errors.email = "Email wajib diisi.";
    else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = "Format email tidak valid.";
    if (!password) errors.password = "Password wajib diisi.";
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setAuthError(describeAuthError(signInError.message));
      setLoading(false);
      return;
    }

    recordLogin().catch(() => {});

    const next = searchParams.get("next") ?? "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm space-y-5"
    >
      <div className="relative mx-auto mb-2 h-16 w-56">
        <Image
          src={logoUrl}
          alt={brandName}
          fill
          className="object-contain"
          unoptimized={logoUrl !== "/images/logo-eleven.png"}
          priority
        />
      </div>

      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Masuk ke Content Studio</h1>
        <p className="mt-1 text-sm text-ink-500">Gunakan akun yang diberikan oleh admin.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-700">
          Email
        </label>
        <div className="relative">
          <Mail
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              fieldErrors.email ? "text-red-500" : "text-ink-500"
            }`}
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition focus:ring-2 ${
              fieldErrors.email
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-ink-900/10 focus:border-brand-blue focus:ring-brand-blue/20"
            }`}
            placeholder="nama@elevendigital.com"
          />
        </div>
        {fieldErrors.email && (
          <p id="email-error" className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-700">
          Password
        </label>
        <div className="relative">
          <Lock
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              fieldErrors.password ? "text-red-500" : "text-ink-500"
            }`}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm text-ink-900 outline-none transition focus:ring-2 ${
              fieldErrors.password
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-ink-900/10 focus:border-brand-blue focus:ring-brand-blue/20"
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 transition hover:text-ink-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="password-error" className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      {authError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Masuk
      </button>
    </motion.form>
  );
}
