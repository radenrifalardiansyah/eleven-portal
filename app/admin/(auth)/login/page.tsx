import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { getSiteSettings } from "@/lib/cms/public-site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getSiteSettings();
  const faviconUrl = branding.adminFaviconUrl || branding.faviconUrl || "/images/favicon.png";

  return {
    title: "Admin Login",
    robots: { index: false, follow: false },
    icons: { icon: faviconUrl, apple: faviconUrl },
  };
}

export default async function AdminLoginPage() {
  const { branding, company } = await getSiteSettings();
  const adminLogoUrl = branding.adminLogoUrl || branding.logoUrl;
  const brandName = company.brandName || "Eleven Digital";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2">
          {adminLogoUrl ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/15 backdrop-blur">
              <Image src={adminLogoUrl} alt={brandName} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-lg font-bold text-white backdrop-blur">
              11
            </div>
          )}
          <span className="font-heading text-lg font-semibold text-white">{brandName}</span>
        </div>
        <div className="relative z-10">
          <h2 className="font-heading text-3xl font-semibold leading-tight text-white">
            Kelola seluruh konten portal dari satu tempat.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            Content Studio untuk tim {brandName} — products, services, stories, team, hingga case
            study.
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
