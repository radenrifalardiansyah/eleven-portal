"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

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
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">Masuk ke Content Studio</h1>
        <p className="mt-1 text-sm text-ink-500">Gunakan akun yang diberikan oleh admin.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            placeholder="nama@elevendigital.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-700">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
