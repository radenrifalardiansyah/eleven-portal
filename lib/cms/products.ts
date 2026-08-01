import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"] & { serviceTitle: string };

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const [{ data: products, error }, { data: services, error: serviceError }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order").order("id"),
    supabase.from("services").select("id, title"),
  ]);
  if (error) throw new Error(error.message);
  if (serviceError) throw new Error(serviceError.message);

  const titleById = new Map((services ?? []).map((s) => [s.id, s.title]));
  return (products ?? []).map((p) => ({ ...p, serviceTitle: titleById.get(p.service_id) ?? "" }));
}
