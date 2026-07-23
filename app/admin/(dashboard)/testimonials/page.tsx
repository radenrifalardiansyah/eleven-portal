import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getAllTestimonialClients } from "@/lib/cms/testimonials";
import TestimonialsClient from "@/components/admin/testimonials/TestimonialsClient";
import SectionContentCard from "@/components/admin/SectionContentCard";

export default async function AdminTestimonialsPage() {
  const profile = await requireModule("testimonials", "view");
  const clients = await getAllTestimonialClients();

  const canCreate = can(profile.permissions, "testimonials", "edit");
  const canEdit = can(profile.permissions, "testimonials", "edit");
  const canDelete = can(profile.permissions, "testimonials", "delete");
  const canApprove = can(profile.permissions, "testimonials", "approve");
  const canPublish = can(profile.permissions, "testimonials", "publish");
  const canViewSection = can(profile.permissions, "page_sections", "view");
  const canEditSection = can(profile.permissions, "page_sections", "edit");

  let sectionContent: Record<string, string> = {};
  if (canViewSection) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("page_sections")
      .select("content")
      .eq("page_key", "home")
      .eq("section_key", "testimonials_header")
      .maybeSingle();
    sectionContent = (data?.content as Record<string, string>) ?? {};
  }

  return (
    <div className="space-y-6">
      {canViewSection && (
        <SectionContentCard
          pageKey="home"
          sectionKey="testimonials_header"
          title="Judul & Deskripsi Section"
          description="Teks yang tampil di homepage sebelum logo klien"
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Judul" },
          ]}
          initialContent={sectionContent}
          canEdit={canEditSection}
        />
      )}

      <TestimonialsClient
        clients={clients}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        canPublish={canPublish}
      />
    </div>
  );
}
