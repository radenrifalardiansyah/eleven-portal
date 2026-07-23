import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Service = Database["public"]["Tables"]["services"]["Row"];

export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
