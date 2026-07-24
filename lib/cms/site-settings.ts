import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_BRANDING,
  EMPTY_COMPANY,
  EMPTY_CONTACT,
  EMPTY_COPYRIGHT,
  EMPTY_SOCIAL_LINKS,
  type SiteBranding,
  type SiteCompany,
  type SiteContact,
  type SiteCopyright,
  type SiteSocialLinks,
} from "./public-site-settings";

export async function getSiteSettingsAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error(error.message);

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  return {
    contact: (map.get("contact") as SiteContact | undefined) ?? EMPTY_CONTACT,
    branding: (map.get("branding") as SiteBranding | undefined) ?? EMPTY_BRANDING,
    company: (map.get("company") as SiteCompany | undefined) ?? EMPTY_COMPANY,
    socialLinks: (map.get("social_links") as SiteSocialLinks | undefined) ?? EMPTY_SOCIAL_LINKS,
    copyright: (map.get("copyright") as SiteCopyright | undefined) ?? EMPTY_COPYRIGHT,
  };
}
