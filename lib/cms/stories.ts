import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Story = Database["public"]["Tables"]["stories"]["Row"];

export async function getAllStories(): Promise<Story[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
