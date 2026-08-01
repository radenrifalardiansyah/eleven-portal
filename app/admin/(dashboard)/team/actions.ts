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
  photo_url: string | null;
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
  const { data: last } = await supabase
    .from("team_members")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (last?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("team_members").insert({ ...input, status, sort_order });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
}

export async function updateTeamMember(id: string, input: TeamMemberInput) {
  const profile = await requireModule("team", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "team", "publish"));
  const { error } = await supabase.from("team_members").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
  revalidatePath(`/team/${input.slug}`);
}

export async function deleteTeamMember(id: string, slug: string) {
  await requireModule("team", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
  revalidatePath(`/team/${slug}`);
}

export async function deleteTeamMembers(items: { id: string; slug: string }[]) {
  await requireModule("team", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .delete()
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/team/${item.slug}`);
}

export async function reviewTeamMembers(items: { id: string; slug: string }[], approve: boolean) {
  await requireModule("team", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .update({ status: approve ? "published" : "draft" })
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/team/${item.slug}`);
}

export async function moveTeamMember(id: string, direction: "up" | "down") {
  await requireModule("team", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("team_members")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Anggota tim tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("team_members")
    .select("id, sort_order")
    .order("sort_order").order("id");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("team_members").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("team_members").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath(`/team/${slug}`);
}
