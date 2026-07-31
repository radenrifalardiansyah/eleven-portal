import { createPublicClient } from "@/lib/supabase/public";

export type SectionHeaderContent = {
  eyebrow?: string;
  title?: string;
  title_prefix?: string;
  title_highlight?: string;
  title_suffix?: string;
  description?: string;
  cta_label?: string;
  cta_href?: string;
  secondary_label?: string;
  secondary_href?: string;
  submit_label?: string;
  image?: string;
};

export async function getHomeSectionContent(): Promise<Record<string, SectionHeaderContent>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("section_key, content")
    .eq("page_key", "home");
  if (error) throw new Error(error.message);

  return Object.fromEntries(
    (data ?? []).map((row) => [row.section_key, (row.content as SectionHeaderContent) ?? {}])
  );
}
