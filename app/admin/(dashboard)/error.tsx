"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { ACCESS_DENIED_MESSAGE } from "@/lib/auth/errors";

export default function AdminDashboardError({ error }: { error: Error & { digest?: string } }) {
  const isAccessDenied = error.message === ACCESS_DENIED_MESSAGE;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
        {isAccessDenied ? <ShieldAlert className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
      </div>
      <div className="space-y-1.5">
        <p className="font-heading text-lg font-semibold text-ink-900">
          {isAccessDenied ? "Akses Ditolak" : "Terjadi Kesalahan"}
        </p>
        <p className="max-w-sm text-sm text-ink-500">
          {isAccessDenied
            ? "Role Anda belum punya izin untuk membuka halaman ini. Hubungi Super Admin kalau ini seharusnya bisa Anda akses."
            : "Ada yang tidak beres saat memuat halaman ini. Coba muat ulang, atau kembali ke Dashboard."}
        </p>
      </div>
      <Link
        href="/admin"
        className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
