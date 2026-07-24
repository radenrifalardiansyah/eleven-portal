import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type PortalNavLink = { label: string; href: string; matchPath?: string };

export const getPortalNavLinks = cache(async (): Promise<PortalNavLink[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("label, portal_label, portal_href, portal_match_path, portal_sort_order")
    .eq("show_on_portal", true)
    .order("portal_sort_order");
  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => row.portal_href)
    .map((row) => ({
      label: row.portal_label || row.label,
      href: row.portal_href as string,
      matchPath: row.portal_match_path ?? undefined,
    }));
});
