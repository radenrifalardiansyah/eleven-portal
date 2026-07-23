"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type ProductInput = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  long_description: string;
  features: string[];
  gallery: string[];
  image: string;
  status: ContentStatus;
  sort_order: number;
};

/** Only users with "publish" can set status straight to published — everyone else is clamped to pending. */
function clampStatus(status: ContentStatus, canPublish: boolean): ContentStatus {
  if (status === "published" && !canPublish) return "pending";
  return status;
}

export async function createProduct(input: ProductInput) {
  const profile = await requireModule("products", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "products", "publish"));
  const { error } = await supabase.from("products").insert({ ...input, status });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateProduct(id: string, input: ProductInput) {
  const profile = await requireModule("products", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "products", "publish"));
  const { error } = await supabase.from("products").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${input.slug}`);
}

export async function deleteProduct(id: string, slug: string) {
  await requireModule("products", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
}

export async function importProducts(rows: ProductInput[]) {
  const profile = await requireModule("products", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "products", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("products").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function reviewProduct(id: string, slug: string, approve: boolean) {
  await requireModule("products", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: approve ? "published" : "draft" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
}
