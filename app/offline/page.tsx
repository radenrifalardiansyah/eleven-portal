import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-paper px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <WifiOff className="h-7 w-7" />
      </div>
      <h1 className="font-heading text-xl font-semibold text-ink-900">Anda sedang offline</h1>
      <p className="max-w-sm text-sm text-ink-500">
        Koneksi internet terputus. Halaman ini akan otomatis normal kembali begitu koneksi Anda tersambung.
      </p>
    </div>
  );
}
