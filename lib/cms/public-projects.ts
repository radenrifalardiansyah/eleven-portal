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

const SELECT_COLUMNS = "slug, title, category, year, image, href, description, long_description, services";

type ProjectRow = {
  slug: string;
  title: string;
  category: string;
  year: string;
  image: string;
  href: string;
  description: string;
  long_description: string;
  services: string[];
};

function toPublicProject(row: ProjectRow): PublicProject {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
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
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPublicProject);
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? toPublicProject(data) : null;
}
