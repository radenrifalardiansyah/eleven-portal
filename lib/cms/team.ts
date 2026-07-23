import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
