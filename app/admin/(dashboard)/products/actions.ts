"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";
import type { CurrencyCode } from "@/lib/currency";
import type { ProductPackage } from "@/lib/cms/product-packages";

export type ProductInput = {
  slug: string;
  name: string;
  service_id: string;
  price_currency: CurrencyCode;
  packages: ProductPackage[];
  description: string;
  long_description: string;
  features: string[];
  gallery: string[];
  image: string;
  status: ContentStatus;
  sort_order: number;
};

/** Import rows come from Excel with a service *title*, not an id — the id is
 *  resolved server-side in importProducts() by looking up the existing
 *  services table (services can't be auto-created from just a title, unlike
 *  the old free-text product category). */
export type ProductImportRow = Omit<ProductInput, "service_id"> & { service: string };

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
  revalidatePath("/");
}

export async function updateProduct(id: string, input: ProductInput) {
  const profile = await requireModule("products", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "products", "publish"));
  const { error } = await supabase.from("products").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${input.slug}`);
}

export async function deleteProduct(id: string, slug: string) {
  await requireModule("products", "delete");
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error(`Masih ada ${count} case study yang memakai produk ini. Pindahkan case study tersebut ke produk lain dulu.`);
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
}

export async function deleteProducts(items: { id: string; slug: string }[]) {
  await requireModule("products", "delete");
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .in("product_id", items.map((i) => i.id));
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error(`Masih ada ${count} case study yang memakai produk terpilih. Pindahkan case study tersebut ke produk lain dulu.`);
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/products/${item.slug}`);
}

export async function reviewProducts(items: { id: string; slug: string }[], approve: boolean) {
  await requireModule("products", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: approve ? "published" : "draft" })
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/products/${item.slug}`);
}

export async function moveProduct(id: string, direction: "up" | "down") {
  await requireModule("products", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("products")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Produk tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("products")
    .select("id, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("products").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("products").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function importProducts(rows: ProductImportRow[]) {
  const profile = await requireModule("products", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "products", "publish");

  const serviceTitles = Array.from(new Set(rows.map((r) => r.service.trim()).filter(Boolean)));
  const { data: services, error: serviceError } = await supabase
    .from("services")
    .select("id, title")
    .in("title", serviceTitles);
  if (serviceError) throw new Error(serviceError.message);

  const idByTitle = new Map((services ?? []).map((s) => [s.title, s.id]));
  const missingTitles = serviceTitles.filter((title) => !idByTitle.has(title));
  if (missingTitles.length > 0) {
    throw new Error(`Layanan tidak ditemukan: ${missingTitles.join(", ")}. Buat layanan tersebut dulu di menu Layanan.`);
  }

  const clamped = rows.map((r) => {
    const { service, ...rest } = r;
    return {
      ...rest,
      service_id: idByTitle.get(service.trim())!,
      status: clampStatus(r.status, canPublish),
    };
  });
  const { error } = await supabase.from("products").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
}
