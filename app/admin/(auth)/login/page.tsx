import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold text-white backdrop-blur">
            11
          </div>
          <span className="font-heading text-lg font-semibold text-white">Eleven Digital</span>
        </div>
        <div className="relative z-10">
          <h2 className="font-heading text-3xl font-semibold leading-tight text-white">
            Kelola seluruh konten portal dari satu tempat.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            Content Studio untuk tim Eleven Digital Indonesia — products, services, stories, team,
            hingga case study.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
