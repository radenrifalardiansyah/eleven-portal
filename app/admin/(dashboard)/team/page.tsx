import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getAllTeamMembers } from "@/lib/cms/team";
import TeamClient from "@/components/admin/team/TeamClient";
import SectionContentCard from "@/components/admin/SectionContentCard";

export default async function AdminTeamPage() {
  const profile = await requireModule("team", "view");
  const members = await getAllTeamMembers();

  const canCreate = can(profile.permissions, "team", "edit");
  const canEdit = can(profile.permissions, "team", "edit");
  const canDelete = can(profile.permissions, "team", "delete");
  const canApprove = can(profile.permissions, "team", "approve");
  const canPublish = can(profile.permissions, "team", "publish");
  const canViewSection = can(profile.permissions, "page_sections", "view");
  const canEditSection = can(profile.permissions, "page_sections", "edit");

  let sectionContent: Record<string, string> = {};
  if (canViewSection) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("page_sections")
      .select("content")
      .eq("page_key", "home")
      .eq("section_key", "team_header")
      .maybeSingle();
    sectionContent = (data?.content as Record<string, string>) ?? {};
  }

  return (
    <div className="space-y-6">
      {canViewSection && (
        <SectionContentCard
          pageKey="home"
          sectionKey="team_header"
          title="Judul & Deskripsi Section"
          description="Teks yang tampil di homepage sebelum daftar tim"
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Judul" },
            { key: "cta_label", label: "Label Tombol" },
          ]}
          initialContent={sectionContent}
          canEdit={canEditSection}
        />
      )}

      <TeamClient
        members={members}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        canPublish={canPublish}
      />
    </div>
  );
}
