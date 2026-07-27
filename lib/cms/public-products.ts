import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice } from "@/lib/currency";

export type PublicProduct = {
  slug: string;
  name: string;
  category: string;
  price: string;
  priceAmount: number;
  priceCurrency: string;
  description: string;
  longDescription: string;
  features: string[];
  gallery: string[];
  image: string;
};

const SELECT_COLUMNS =
  "slug, name, service_id, price_amount, price_currency, description, long_description, features, gallery, image";

type ProductRow = {
  slug: string;
  name: string;
  service_id: string;
  price_amount: number;
  price_currency: string;
  description: string;
  long_description: string;
  features: string[];
  gallery: string[];
  image: string;
};

function toPublicProduct(row: ProductRow, serviceTitle: string): PublicProduct {
  return {
    slug: row.slug,
    name: row.name,
    category: serviceTitle,
    price: formatPrice(row.price_amount, row.price_currency),
    priceAmount: row.price_amount,
    priceCurrency: row.price_currency,
    description: row.description,
    longDescription: row.long_description,
    features: row.features,
    gallery: row.gallery,
    image: row.image,
  };
}

export async function getPublishedProducts(): Promise<PublicProduct[]> {
  const supabase = createPublicClient();
  const [{ data, error }, { data: services, error: serviceError }] = await Promise.all([
    supabase.from("products").select(SELECT_COLUMNS).eq("status", "published").order("sort_order"),
    supabase.from("services").select("id, title"),
  ]);
  if (error) throw new Error(error.message);
  if (serviceError) throw new Error(serviceError.message);

  const titleById = new Map((services ?? []).map((s) => [s.id, s.title]));
  return (data ?? []).map((row) => toPublicProduct(row, titleById.get(row.service_id) ?? ""));
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;

  const { data: service } = await supabase
    .from("services")
    .select("title")
    .eq("id", data.service_id)
    .maybeSingle();

  return toPublicProduct(data, service?.title ?? "");
}
