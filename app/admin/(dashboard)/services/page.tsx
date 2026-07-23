import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getAllServices } from "@/lib/cms/services";
import ServicesClient from "@/components/admin/services/ServicesClient";
import SectionContentCard from "@/components/admin/SectionContentCard";

export default async function AdminServicesPage() {
  const profile = await requireModule("services", "view");
  const services = await getAllServices();

  const canCreate = can(profile.permissions, "services", "edit");
  const canEdit = can(profile.permissions, "services", "edit");
  const canDelete = can(profile.permissions, "services", "delete");
  const canApprove = can(profile.permissions, "services", "approve");
  const canPublish = can(profile.permissions, "services", "publish");
  const canViewSection = can(profile.permissions, "page_sections", "view");
  const canEditSection = can(profile.permissions, "page_sections", "edit");

  let sectionContent: Record<string, string> = {};
  if (canViewSection) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("page_sections")
      .select("content")
      .eq("page_key", "home")
      .eq("section_key", "services_header")
      .maybeSingle();
    sectionContent = (data?.content as Record<string, string>) ?? {};
  }

  return (
    <div className="space-y-6">
      {canViewSection && (
        <SectionContentCard
          pageKey="home"
          sectionKey="services_header"
          title="Judul & Deskripsi Section"
          description="Teks yang tampil di homepage sebelum daftar layanan"
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Judul" },
            { key: "cta_label", label: "Label Tombol" },
          ]}
          initialContent={sectionContent}
          canEdit={canEditSection}
        />
      )}

      <ServicesClient
        services={services}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        canPublish={canPublish}
      />
    </div>
  );
}
