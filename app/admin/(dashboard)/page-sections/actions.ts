"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function updatePageSectionContent(
  pageKey: string,
  sectionKey: string,
  content: Record<string, string>
) {
  await requireModule("page_sections", "edit");
  const supabase = await createClient();
  const { error } = await supabase
    .from("page_sections")
    .update({ content })
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
