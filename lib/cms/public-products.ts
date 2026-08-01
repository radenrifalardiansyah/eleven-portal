import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice } from "@/lib/currency";
import {
  packageDiscountLabel,
  packageFinalPrice,
  packagePriceSummary,
  type ProductPackage,
} from "@/lib/cms/product-packages";

export type PublicPackage = {
  id: string;
  name: string;
  price: string;
  priceAmount: number;
  originalPrice: string | null;
  discountLabel: string | null;
  description: string;
};

export type PublicProduct = {
  slug: string;
  name: string;
  category: string;
  price: string;
  priceAmount: number;
  priceCurrency: string;
  packages: PublicPackage[];
  description: string;
  longDescription: string;
  features: string[];
  gallery: string[];
  image: string;
};

const SELECT_COLUMNS =
  "slug, name, service_id, price_currency, packages, description, long_description, features, gallery, image";

type ProductRow = {
  slug: string;
  name: string;
  service_id: string;
  price_currency: string;
  packages: ProductPackage[];
  description: string;
  long_description: string;
  features: string[];
  gallery: string[];
  image: string;
};

function toPublicPackage(pkg: ProductPackage, currency: string): PublicPackage {
  const finalPrice = packageFinalPrice(pkg);
  const hasDiscount = finalPrice < pkg.price_amount;
  return {
    id: pkg.id,
    name: pkg.name,
    price: formatPrice(finalPrice, currency),
    priceAmount: finalPrice,
    originalPrice: hasDiscount ? formatPrice(pkg.price_amount, currency) : null,
    discountLabel: packageDiscountLabel(pkg, currency),
    description: pkg.description,
  };
}

function toPublicProduct(row: ProductRow, serviceTitle: string): PublicProduct {
  const packages = row.packages ?? [];
  const lowestPrice = packages.length > 0 ? Math.min(...packages.map(packageFinalPrice)) : 0;
  return {
    slug: row.slug,
    name: row.name,
    category: serviceTitle,
    price: packagePriceSummary(packages, row.price_currency),
    priceAmount: lowestPrice,
    priceCurrency: row.price_currency,
    packages: packages.map((pkg) => toPublicPackage(pkg, row.price_currency)),
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
    supabase.from("products").select(SELECT_COLUMNS).eq("status", "published").order("sort_order").order("id"),
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
