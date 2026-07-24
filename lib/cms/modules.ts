import { createClient } from "@/lib/supabase/server";

export type ModuleRow = {
  key: string;
  label: string;
  sort_order: number;
};

export async function getAllModules(): Promise<ModuleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("modules").select("key, label, sort_order").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
