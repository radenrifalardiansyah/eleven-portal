"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type TeamMemberInput = {
  slug: string;
  name: string;
  position: string;
  bio: string;
  long_bio: string;
  email: string;
  socials: { instagram?: string; facebook?: string; twitter?: string };
  status: ContentStatus;
  sort_order: number;
};

function clampStatus(status: ContentStatus, canPublish: boolean): ContentStatus {
  if (status === "published" && !canPublish) return "pending";
  return status;
}

export async function createTeamMember(input: TeamMemberInput) {
  const profile = await requireModule("team", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "team", "publish"));
  const { error } = await supabase.from("team_members").insert({ ...input, status });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
}

export async function updateTeamMember(id: string, input: TeamMemberInput) {
  const profile = await requireModule("team", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "team", "publish"));
  const { error } = await supabase.from("team_members").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath(`/team/${input.slug}`);
}

export async function deleteTeamMember(id: string, slug: string) {
  await requireModule("team", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath(`/team/${slug}`);
}

export async function importTeamMembers(rows: TeamMemberInput[]) {
  const profile = await requireModule("team", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "team", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("team_members").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
}

export async function reviewTeamMember(id: string, slug: string, approve: boolean) {
  await requireModule("team", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .update({ status: approve ? "published" : "draft" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath(`/team/${slug}`);
}
