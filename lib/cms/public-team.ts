import { createPublicClient } from "@/lib/supabase/public";

export type PublicTeamMember = {
  slug: string;
  name: string;
  position: string;
  bio: string;
  longBio: string;
  email: string;
  photoUrl: string | null;
  socials: { instagram?: string; facebook?: string; twitter?: string };
};

const SELECT_COLUMNS = "slug, name, position, bio, long_bio, email, photo_url, socials";

type TeamMemberRow = {
  slug: string;
  name: string;
  position: string;
  bio: string;
  long_bio: string;
  email: string;
  photo_url: string | null;
  socials: { instagram?: string; facebook?: string; twitter?: string };
};

function toPublicTeamMember(row: TeamMemberRow): PublicTeamMember {
  return {
    slug: row.slug,
    name: row.name,
    position: row.position,
    bio: row.bio,
    longBio: row.long_bio,
    email: row.email,
    photoUrl: row.photo_url,
    socials: row.socials ?? {},
  };
}

export async function getPublishedTeamMembers(): Promise<PublicTeamMember[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("team_members")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPublicTeamMember);
}

export async function getTeamMemberBySlug(slug: string): Promise<PublicTeamMember | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("team_members")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? toPublicTeamMember(data) : null;
}
