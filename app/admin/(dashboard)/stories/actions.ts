"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type StoryInput = {
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
  status: ContentStatus;
  sort_order: number;
};

function clampStatus(status: ContentStatus, canPublish: boolean): ContentStatus {
  if (status === "published" && !canPublish) return "pending";
  return status;
}

export async function createStory(input: StoryInput) {
  const profile = await requireModule("stories", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "stories", "publish"));
  const { error } = await supabase.from("stories").insert({ ...input, status });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function updateStory(id: string, input: StoryInput) {
  const profile = await requireModule("stories", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "stories", "publish"));
  const { error } = await supabase.from("stories").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath(`/stories/${input.slug}`);
}

export async function deleteStory(id: string, slug: string) {
  await requireModule("stories", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath(`/stories/${slug}`);
}

export async function deleteStories(items: { id: string; slug: string }[]) {
  await requireModule("stories", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .delete()
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  for (const item of items) revalidatePath(`/stories/${item.slug}`);
}

export async function reviewStories(items: { id: string; slug: string }[], approve: boolean) {
  await requireModule("stories", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({ status: approve ? "published" : "draft" })
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  for (const item of items) revalidatePath(`/stories/${item.slug}`);
}

export async function moveStory(id: string, direction: "up" | "down") {
  await requireModule("stories", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("stories")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Story tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("stories")
    .select("id, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("stories").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("stories").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function importStories(rows: StoryInput[]) {
  const profile = await requireModule("stories", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "stories", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("stories").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
}

export async function reviewStory(id: string, slug: string, approve: boolean) {
  await requireModule("stories", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({ status: approve ? "published" : "draft" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath(`/stories/${slug}`);
}
