import { createPublicClient } from "@/lib/supabase/public";

export type PublicProjectClient = {
  name: string;
  logo: string;
};

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
  client: PublicProjectClient | null;
};

const SELECT_COLUMNS =
  "slug, title, product_id, client_id, year, image, href, description, long_description, services";

type ProjectRow = {
  slug: string;
  title: string;
  product_id: string | null;
  client_id: string | null;
  year: string;
  image: string;
  href: string;
  description: string;
  long_description: string;
  services: string[];
};

function toPublicProject(
  row: ProjectRow,
  productName: string,
  client: PublicProjectClient | null
): PublicProject {
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
    client,
  };
}

export async function getPublishedProjects(): Promise<PublicProject[]> {
  const supabase = createPublicClient();
  const [{ data, error }, { data: products, error: productError }, { data: clients, error: clientError }] =
    await Promise.all([
      supabase.from("projects").select(SELECT_COLUMNS).eq("status", "published").order("sort_order").order("id"),
      supabase.from("products").select("id, name"),
      supabase.from("testimonial_clients").select("id, name, logo"),
    ]);
  if (error) throw new Error(error.message);
  if (productError) throw new Error(productError.message);
  if (clientError) throw new Error(clientError.message);

  const nameById = new Map((products ?? []).map((p) => [p.id, p.name]));
  const clientById = new Map((clients ?? []).map((c) => [c.id, { name: c.name, logo: c.logo }]));
  return (data ?? []).map((row) =>
    toPublicProject(
      row,
      (row.product_id ? nameById.get(row.product_id) : undefined) ?? "",
      (row.client_id ? clientById.get(row.client_id) : undefined) ?? null
    )
  );
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

  const [{ data: product }, { data: client }] = await Promise.all([
    data.product_id
      ? supabase.from("products").select("name").eq("id", data.product_id).maybeSingle()
      : Promise.resolve({ data: null }),
    data.client_id
      ? supabase.from("testimonial_clients").select("name, logo").eq("id", data.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return toPublicProject(data, product?.name ?? "", client ? { name: client.name, logo: client.logo } : null);
}
