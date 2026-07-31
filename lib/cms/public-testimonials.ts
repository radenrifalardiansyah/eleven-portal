import { createPublicClient } from "@/lib/supabase/public";

export type PublicTestimonial = {
  logo: string;
  name: string;
  quote: string;
  author: string;
  rating: number | null;
};

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

export async function getPublishedTestimonialQuotes(): Promise<PublicTestimonial[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonial_clients")
    .select("logo, name, testimonial_quote, testimonial_author, testimonial_rating")
    .eq("status", "published")
    .neq("testimonial_quote", "")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    logo: row.logo,
    name: row.name,
    quote: row.testimonial_quote,
    author: row.testimonial_author,
    rating: row.testimonial_rating,
  }));
}
