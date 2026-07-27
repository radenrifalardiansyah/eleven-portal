import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getMenuForRole } from "@/lib/cms/menu";
import { getSiteSettings } from "@/lib/cms/public-site-settings";
import AdminChrome from "@/components/admin/AdminChrome";

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getSiteSettings();
  const faviconUrl = branding.adminFaviconUrl || branding.faviconUrl || "/images/favicon.png";

  return {
    icons: {
      icon: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");

  const [navGroups, { branding, company }] = await Promise.all([
    getMenuForRole(profile.permissions),
    getSiteSettings(),
  ]);

  return (
    <AdminChrome profile={profile} navGroups={navGroups} branding={branding} company={company}>
      {children}
    </AdminChrome>
  );
}
