import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { Briefcase, Layers, Newspaper, Package, Users, type LucideIcon } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { getSiteSettings } from "@/lib/cms/public-site-settings";
import { getVisibleHomeSections } from "@/lib/cms/public-menu";

/** Icon + label shown for each module in the login panel — kept local
 *  (not read from menu_items.icon) so it never regresses to a generic
 *  fallback icon if that field holds an unexpected value; the sort order
 *  still mirrors Struktur Menu via getVisibleHomeSections(). */
const MODULE_DISPLAY: Record<string, { label: string; icon: LucideIcon }> = {
  products: { label: "Products", icon: Package },
  services: { label: "Services", icon: Layers },
  stories: { label: "Stories", icon: Newspaper },
  team: { label: "Team", icon: Users },
  projects: { label: "Case Study", icon: Briefcase },
};

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getSiteSettings();
  const faviconUrl = branding.adminFaviconUrl || branding.faviconUrl || "/images/favicon.png";

  return {
    title: "Admin Login",
    robots: { index: false, follow: false },
    icons: { icon: faviconUrl, apple: faviconUrl },
    manifest: "/admin/manifest.webmanifest",
  };
}

export default async function AdminLoginPage() {
  const { branding, company } = await getSiteSettings();
  const adminLogoUrl = branding.adminLogoUrl || branding.logoUrl;
  const portalLogoUrl = branding.logoUrl || "/images/logo-eleven.png";
  const brandName = company.brandName || "Eleven Digital";
  const homeSections = await getVisibleHomeSections();
  const modules = homeSections
    .map((key) => MODULE_DISPLAY[key])
    .filter((m): m is { label: string; icon: LucideIcon } => Boolean(m));

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-white/10 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-16 h-96 w-96 animate-blob rounded-full bg-brand-yellow/20 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute left-1/3 top-1/2 h-56 w-56 animate-blob rounded-full bg-white/10 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
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

        <div className="relative z-10 flex flex-wrap justify-center gap-x-10 gap-y-6">
          {modules.map(({ label, icon: Icon }, i) => (
            <div
              key={label}
              className="flex w-20 flex-col items-center gap-2 text-center animate-float"
              style={{ animationDelay: `-${i * 1.2}s` }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium leading-tight text-white/70">{label}</span>
            </div>
          ))}
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
          <LoginForm logoUrl={portalLogoUrl} brandName={brandName} />
        </Suspense>
      </div>
    </div>
  );
}
