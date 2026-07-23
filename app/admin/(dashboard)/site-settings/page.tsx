import { requireModule } from "@/lib/auth/session";
import ComingSoon from "@/components/admin/ComingSoon";

export default async function AdminSiteSettingsPage() {
  await requireModule("site_settings", "view");
  return <ComingSoon title="Site Settings" />;
}
