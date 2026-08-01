"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type ProjectInput = {
  slug: string;
  title: string;
  product_id: string;
  client_id: string | null;
  year: string;
  image: string;
  href: string;
  description: string;
  long_description: string;
  services: string[];
  status: ContentStatus;
  sort_order: number;
};

/** Import rows come from Excel with a product *name* and an optional client
 *  *name*, not ids — resolved server-side in importProjects() by looking up
 *  the existing products/testimonial_clients tables. The product must exist
 *  (it's required); an unmatched client name is just left unlinked (null). */
export type ProjectImportRow = Omit<ProjectInput, "product_id" | "client_id"> & { product: string; client: string };

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
  revalidatePath("/");
}

export async function updateProject(id: string, input: ProjectInput) {
  const profile = await requireModule("projects", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "projects", "publish"));
  const { error } = await supabase.from("projects").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath("/");
  revalidatePath(`/case-study/${input.slug}`);
}

export async function deleteProject(id: string, slug: string) {
  await requireModule("projects", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath("/");
  revalidatePath(`/case-study/${slug}`);
}

export async function deleteProjects(items: { id: string; slug: string }[]) {
  await requireModule("projects", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/case-study/${item.slug}`);
}

export async function reviewProjects(items: { id: string; slug: string }[], approve: boolean) {
  await requireModule("projects", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: approve ? "published" : "draft" })
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/case-study/${item.slug}`);
}

export async function moveProject(id: string, direction: "up" | "down") {
  await requireModule("projects", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("projects")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Case study tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("projects").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("projects").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath("/");
}

export async function importProjects(rows: ProjectImportRow[]) {
  const profile = await requireModule("projects", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "projects", "publish");

  const productNames = Array.from(new Set(rows.map((r) => r.product.trim()).filter(Boolean)));
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .in("name", productNames);
  if (productError) throw new Error(productError.message);

  const productIdByName = new Map((products ?? []).map((p) => [p.name, p.id]));
  const missingNames = productNames.filter((name) => !productIdByName.has(name));
  if (missingNames.length > 0) {
    throw new Error(`Produk tidak ditemukan: ${missingNames.join(", ")}. Buat produk tersebut dulu di menu Produk.`);
  }

  const clientNames = Array.from(new Set(rows.map((r) => r.client.trim()).filter(Boolean)));
  const { data: clients, error: clientError } = await supabase
    .from("testimonial_clients")
    .select("id, name")
    .in("name", clientNames);
  if (clientError) throw new Error(clientError.message);
  const clientIdByName = new Map((clients ?? []).map((c) => [c.name, c.id]));

  const clamped = rows.map((r) => {
    const { product, client, ...rest } = r;
    return {
      ...rest,
      product_id: productIdByName.get(product.trim())!,
      client_id: clientIdByName.get(client.trim()) ?? null,
      status: clampStatus(r.status, canPublish),
    };
  });
  const { error } = await supabase.from("projects").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  revalidatePath("/case-study");
  revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath(`/case-study/${slug}`);
}
