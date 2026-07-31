import { createClient } from "@/lib/supabase/server";

export type PageSectionRow = {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, string>;
};

export async function getAllPageSections(pageKey: string): Promise<PageSectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("id, page_key, section_key, content")
    .eq("page_key", pageKey);
  if (error) throw new Error(error.message);
  return (data ?? []) as PageSectionRow[];
}
