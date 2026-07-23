import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getAllProjects } from "@/lib/cms/projects";
import ProjectsClient from "@/components/admin/projects/ProjectsClient";
import SectionContentCard from "@/components/admin/SectionContentCard";

export default async function AdminCaseStudyPage() {
  const profile = await requireModule("projects", "view");
  const projects = await getAllProjects();

  const canCreate = can(profile.permissions, "projects", "edit");
  const canEdit = can(profile.permissions, "projects", "edit");
  const canDelete = can(profile.permissions, "projects", "delete");
  const canApprove = can(profile.permissions, "projects", "approve");
  const canPublish = can(profile.permissions, "projects", "publish");
  const canViewSection = can(profile.permissions, "page_sections", "view");
  const canEditSection = can(profile.permissions, "page_sections", "edit");

  let sectionContent: Record<string, string> = {};
  if (canViewSection) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("page_sections")
      .select("content")
      .eq("page_key", "home")
      .eq("section_key", "casestudy_header")
      .maybeSingle();
    sectionContent = (data?.content as Record<string, string>) ?? {};
  }

  return (
    <div className="space-y-6">
      {canViewSection && (
        <SectionContentCard
          pageKey="home"
          sectionKey="casestudy_header"
          title="Judul & Deskripsi Section"
          description="Teks yang tampil di homepage sebelum daftar case study"
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Judul" },
            { key: "cta_label", label: "Label Tombol" },
          ]}
          initialContent={sectionContent}
          canEdit={canEditSection}
        />
      )}

      <ProjectsClient
        projects={projects}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        canPublish={canPublish}
      />
    </div>
  );
}
