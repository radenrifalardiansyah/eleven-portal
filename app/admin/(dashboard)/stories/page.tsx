import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { getAllStories } from "@/lib/cms/stories";
import StoriesClient from "@/components/admin/stories/StoriesClient";
import SectionContentCard from "@/components/admin/SectionContentCard";

export default async function AdminStoriesPage() {
  const profile = await requireModule("stories", "view");
  const stories = await getAllStories();

  const canCreate = can(profile.permissions, "stories", "edit");
  const canEdit = can(profile.permissions, "stories", "edit");
  const canDelete = can(profile.permissions, "stories", "delete");
  const canApprove = can(profile.permissions, "stories", "approve");
  const canPublish = can(profile.permissions, "stories", "publish");
  const canViewSection = can(profile.permissions, "page_sections", "view");
  const canEditSection = can(profile.permissions, "page_sections", "edit");

  let sectionContent: Record<string, string> = {};
  if (canViewSection) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("page_sections")
      .select("content")
      .eq("page_key", "home")
      .eq("section_key", "stories_header")
      .maybeSingle();
    sectionContent = (data?.content as Record<string, string>) ?? {};
  }

  return (
    <div className="space-y-6">
      {canViewSection && (
        <SectionContentCard
          pageKey="home"
          sectionKey="stories_header"
          title="Judul & Deskripsi Section"
          description="Teks yang tampil di homepage sebelum daftar stories"
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Judul" },
            { key: "cta_label", label: "Label Tombol" },
          ]}
          initialContent={sectionContent}
          canEdit={canEditSection}
        />
      )}

      <StoriesClient
        stories={stories}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        canPublish={canPublish}
      />
    </div>
  );
}
