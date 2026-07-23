import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/cms/products";
import ProductsClient from "@/components/admin/products/ProductsClient";
import SectionContentCard from "@/components/admin/SectionContentCard";

export default async function AdminProductsPage() {
  const profile = await requireModule("products", "view");
  const products = await getAllProducts();

  const canCreate = can(profile.permissions, "products", "edit");
  const canEdit = can(profile.permissions, "products", "edit");
  const canDelete = can(profile.permissions, "products", "delete");
  const canApprove = can(profile.permissions, "products", "approve");
  const canPublish = can(profile.permissions, "products", "publish");
  const canViewSection = can(profile.permissions, "page_sections", "view");
  const canEditSection = can(profile.permissions, "page_sections", "edit");

  let sectionContent: Record<string, string> = {};
  if (canViewSection) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("page_sections")
      .select("content")
      .eq("page_key", "home")
      .eq("section_key", "products_header")
      .maybeSingle();
    sectionContent = (data?.content as Record<string, string>) ?? {};
  }

  return (
    <div className="space-y-6">
      {canViewSection && (
        <SectionContentCard
          pageKey="home"
          sectionKey="products_header"
          title="Judul & Deskripsi Section"
          description="Teks yang tampil di homepage sebelum daftar produk"
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Judul" },
            { key: "cta_label", label: "Label Tombol" },
          ]}
          initialContent={sectionContent}
          canEdit={canEditSection}
        />
      )}

      <ProductsClient
        products={products}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        canPublish={canPublish}
      />
    </div>
  );
}
