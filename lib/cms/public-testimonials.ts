import { createPublicClient } from "@/lib/supabase/public";

export async function getPublishedClientLogos(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonial_clients")
    .select("logo")
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.logo);
}
