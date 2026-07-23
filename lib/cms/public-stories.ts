import { createPublicClient } from "@/lib/supabase/public";

export type PublicStory = {
  slug: string;
  title: string;
  label: string;
  labelColor: "yellow" | "blue";
  description: string;
  content: string[];
  image: string;
  author: string;
  authorImage: string;
  date: string;
};

const SELECT_COLUMNS = "slug, title, label, label_color, description, content, image, author, author_image, date";

type StoryRow = {
  slug: string;
  title: string;
  label: string;
  label_color: "yellow" | "blue";
  description: string;
  content: string[];
  image: string;
  author: string;
  author_image: string;
  date: string;
};

function toPublicStory(row: StoryRow): PublicStory {
  return {
    slug: row.slug,
    title: row.title,
    label: row.label,
    labelColor: row.label_color,
    description: row.description,
    content: row.content,
    image: row.image,
    author: row.author,
    authorImage: row.author_image,
    date: row.date,
  };
}

export async function getPublishedStories(): Promise<PublicStory[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("stories")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPublicStory);
}

export async function getStoryBySlug(slug: string): Promise<PublicStory | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("stories")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? toPublicStory(data) : null;
}
