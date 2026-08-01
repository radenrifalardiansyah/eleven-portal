import { createPublicClient } from "@/lib/supabase/public";

export type PublicService = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  benefits: string[];
  icon: string;
  gallery: string[];
};

const SELECT_COLUMNS = "slug, title, description, long_description, benefits, icon, gallery";

type ServiceRow = {
  slug: string;
  title: string;
  description: string;
  long_description: string;
  benefits: string[];
  icon: string;
  gallery: string[];
};

function toPublicService(row: ServiceRow): PublicService {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.long_description,
    benefits: row.benefits,
    icon: row.icon,
    gallery: row.gallery,
  };
}

export async function getPublishedServices(): Promise<PublicService[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .order("sort_order").order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPublicService);
}

export async function getServiceBySlug(slug: string): Promise<PublicService | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? toPublicService(data) : null;
}
