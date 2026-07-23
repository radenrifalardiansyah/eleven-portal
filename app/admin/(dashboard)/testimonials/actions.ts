"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type TestimonialClientInput = {
  slug: string;
  name: string;
  logo: string;
  status: ContentStatus;
  sort_order: number;
};

function clampStatus(status: ContentStatus, canPublish: boolean): ContentStatus {
  if (status === "published" && !canPublish) return "pending";
  return status;
}

export async function createTestimonialClient(input: TestimonialClientInput) {
  const profile = await requireModule("testimonials", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "testimonials", "publish"));
  const { error } = await supabase.from("testimonial_clients").insert({ ...input, status });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

export async function updateTestimonialClient(id: string, input: TestimonialClientInput) {
  const profile = await requireModule("testimonials", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "testimonials", "publish"));
  const { error } = await supabase.from("testimonial_clients").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

export async function deleteTestimonialClient(id: string) {
  await requireModule("testimonials", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("testimonial_clients").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

export async function importTestimonialClients(rows: TestimonialClientInput[]) {
  const profile = await requireModule("testimonials", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "testimonials", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("testimonial_clients").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

export async function reviewTestimonialClient(id: string, approve: boolean) {
  await requireModule("testimonials", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonial_clients")
    .update({ status: approve ? "published" : "draft" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}
