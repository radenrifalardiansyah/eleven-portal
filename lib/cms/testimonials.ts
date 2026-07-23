import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type TestimonialClient = Database["public"]["Tables"]["testimonial_clients"]["Row"];

export async function getAllTestimonialClients(): Promise<TestimonialClient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonial_clients").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}
