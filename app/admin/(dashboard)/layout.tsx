import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getMenuForRole } from "@/lib/cms/menu";
import AdminChrome from "@/components/admin/AdminChrome";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");

  const navGroups = await getMenuForRole(profile.permissions);

  return (
    <AdminChrome profile={profile} navGroups={navGroups}>
      {children}
    </AdminChrome>
  );
}
