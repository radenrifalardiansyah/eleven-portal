import { createPublicClient } from "@/lib/supabase/public";

export type PublicProduct = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  longDescription: string;
  features: string[];
  gallery: string[];
  image: string;
};

const SELECT_COLUMNS = "slug, name, category, price, description, long_description, features, gallery, image";

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  long_description: string;
  features: string[];
  gallery: string[];
  image: string;
};

function toPublicProduct(row: ProductRow): PublicProduct {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    description: row.description,
    longDescription: row.long_description,
    features: row.features,
    gallery: row.gallery,
    image: row.image,
  };
}

export async function getPublishedProducts(): Promise<PublicProduct[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPublicProduct);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? toPublicProduct(data) : null;
}
