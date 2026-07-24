import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getSiteSettingsAdmin } from "@/lib/cms/site-settings";
import SiteSettingsForm from "@/components/admin/site-settings/SiteSettingsForm";

export default async function AdminSiteSettingsPage() {
  const profile = await requireModule("site_settings", "view");
  const settings = await getSiteSettingsAdmin();
  const canEdit = can(profile.permissions, "site_settings", "edit");

  return (
    <SiteSettingsForm
      initialBranding={settings.branding}
      initialCompany={settings.company}
      initialContact={settings.contact}
      initialSocialLinks={settings.socialLinks}
      initialCopyright={settings.copyright}
      canEdit={canEdit}
    />
  );
}
