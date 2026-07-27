"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { SiteBranding, SiteCompany, SiteContact, SiteCopyright, SiteSocialLinks } from "@/lib/cms/public-site-settings";

async function upsertSetting(key: string, value: Record<string, unknown> | unknown[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as Record<string, unknown> }, { onConflict: "key" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/site-settings");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/login");
  // Navbar/Footer/JSON-LD/favicon/manifest render on every public page off this table.
  revalidatePath("/", "layout");
}

export async function updateContactSettings(input: SiteContact) {
  await requireModule("site_settings", "edit");
  await upsertSetting("contact", input);
}

export async function updateBranding(input: SiteBranding) {
  await requireModule("site_settings", "edit");
  await upsertSetting("branding", input);
}

export async function updateCompanySettings(input: SiteCompany) {
  await requireModule("site_settings", "edit");
  await upsertSetting("company", input);
}

export async function updateSocialLinks(input: SiteSocialLinks) {
  await requireModule("site_settings", "edit");
  await upsertSetting("social_links", input);
}

export async function updateCopyright(input: SiteCopyright) {
  await requireModule("site_settings", "edit");
  await upsertSetting("copyright", input);
}
