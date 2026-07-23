import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

