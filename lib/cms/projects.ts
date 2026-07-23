import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function getAllProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
