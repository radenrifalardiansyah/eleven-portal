import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type PortalNavLink = { label: string; href: string; matchPath?: string };

export const getPortalNavLinks = cache(async (): Promise<PortalNavLink[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("label, portal_label, portal_href, portal_match_path, sort_order")
    .eq("show_on_portal", true)
    .order("sort_order");
  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => row.portal_href)
    .map((row) => ({
      label: row.portal_label || row.label,
      href: row.portal_href as string,
      matchPath: row.portal_match_path ?? undefined,
    }));
});

/** Module keys of visible homepage sections, in the same order as the
 *  admin sidebar (sort_order) — reordering in Struktur Menu keeps the
 *  admin sidebar, Hak Akses Role, the public navbar, and the homepage
 *  sections all consistent with each other. */
export const getVisibleHomeSections = cache(async (): Promise<string[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("module_key")
    .eq("show_section_on_portal", true)
    .is("parent_id", null)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.module_key);
});
