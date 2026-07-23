"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type ProjectInput = {
  slug: string;
  title: string;
  category: string;
  year: string;
  image: string;
  href: string;
  description: string;
  long_description: string;
  services: string[];
  status: ContentStatus;
  sort_order: number;
};

function clampStatus(status: ContentStatus, canPublish: boolean): ContentStatus {
  if (status === "published" && !canPublish) return "pending";
  return status;
}

export async function createProject(input: ProjectInput) {
  const profile = await requireModule("projects", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "projects", "publish"));
  const { error } = await supabase.from("projects").insert({ ...input, status });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
}

export async function updateProject(id: string, input: ProjectInput) {
  const profile = await requireModule("projects", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "projects", "publish"));
  const { error } = await supabase.from("projects").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath(`/case-study/${input.slug}`);
}

export async function deleteProject(id: string, slug: string) {
  await requireModule("projects", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath(`/case-study/${slug}`);
}

export async function importProjects(rows: ProjectInput[]) {
  const profile = await requireModule("projects", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "projects", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("projects").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
}

export async function reviewProject(id: string, slug: string, approve: boolean) {
  await requireModule("projects", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: approve ? "published" : "draft" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath(`/case-study/${slug}`);
}
