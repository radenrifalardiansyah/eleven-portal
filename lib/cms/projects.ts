import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  productName: string;
  clientName: string;
};

export async function getAllProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const [{ data: projects, error }, { data: products, error: productError }, { data: clients, error: clientError }] =
    await Promise.all([
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("products").select("id, name"),
      supabase.from("testimonial_clients").select("id, name"),
    ]);
  if (error) throw new Error(error.message);
  if (productError) throw new Error(productError.message);
  if (clientError) throw new Error(clientError.message);

  const productNameById = new Map((products ?? []).map((p) => [p.id, p.name]));
  const clientNameById = new Map((clients ?? []).map((c) => [c.id, c.name]));
  return (projects ?? []).map((p) => ({
    ...p,
    productName: (p.product_id && productNameById.get(p.product_id)) ?? "",
    clientName: (p.client_id && clientNameById.get(p.client_id)) ?? "",
  }));
}
