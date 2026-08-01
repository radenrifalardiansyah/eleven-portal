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
  industry: string;
  website: string;
  description: string;
  contact_name: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
  testimonial_quote: string;
  testimonial_author: string;
  testimonial_rating: number | null;
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
  revalidatePath("/");
}

export async function updateTestimonialClient(id: string, input: TestimonialClientInput) {
  const profile = await requireModule("testimonials", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "testimonials", "publish"));
  const { error } = await supabase.from("testimonial_clients").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonialClient(id: string) {
  await requireModule("testimonials", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("testimonial_clients").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonialClients(items: { id: string }[]) {
  await requireModule("testimonials", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonial_clients")
    .delete()
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function reviewTestimonialClients(items: { id: string }[], approve: boolean) {
  await requireModule("testimonials", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonial_clients")
    .update({ status: approve ? "published" : "draft" })
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function moveTestimonialClient(id: string, direction: "up" | "down") {
  await requireModule("testimonials", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("testimonial_clients")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Klien tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("testimonial_clients")
    .select("id, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("testimonial_clients").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("testimonial_clients").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function importTestimonialClients(rows: TestimonialClientInput[]) {
  const profile = await requireModule("testimonials", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "testimonials", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("testimonial_clients").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
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
  revalidatePath("/");
}
