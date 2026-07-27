import { createPublicClient } from "@/lib/supabase/public";

export type PublicProject = {
  slug: string;
  title: string;
  category: string;
  year: string;
  image: string;
  href: string;
  description: string;
  longDescription: string;
  services: string[];
};

const SELECT_COLUMNS = "slug, title, product_id, year, image, href, description, long_description, services";

type ProjectRow = {
  slug: string;
  title: string;
  product_id: string | null;
  year: string;
  image: string;
  href: string;
  description: string;
  long_description: string;
  services: string[];
};

function toPublicProject(row: ProjectRow, productName: string): PublicProject {
  return {
    slug: row.slug,
    title: row.title,
    category: productName,
    year: row.year,
    image: row.image,
    href: row.href,
    description: row.description,
    longDescription: row.long_description,
    services: row.services,
  };
}

export async function getPublishedProjects(): Promise<PublicProject[]> {
  const supabase = createPublicClient();
  const [{ data, error }, { data: products, error: productError }] = await Promise.all([
    supabase.from("projects").select(SELECT_COLUMNS).eq("status", "published").order("sort_order"),
    supabase.from("products").select("id, name"),
  ]);
  if (error) throw new Error(error.message);
  if (productError) throw new Error(productError.message);

  const nameById = new Map((products ?? []).map((p) => [p.id, p.name]));
  return (data ?? []).map((row) => toPublicProject(row, (row.product_id && nameById.get(row.product_id)) ?? ""));
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;

  const { data: product } = data.product_id
    ? await supabase.from("products").select("name").eq("id", data.product_id).maybeSingle()
    : { data: null };

  return toPublicProject(data, product?.name ?? "");
}
