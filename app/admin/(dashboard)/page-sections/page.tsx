import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getAllPageSections } from "@/lib/cms/page-sections";
import PageSectionsClient from "@/components/admin/page-sections/PageSectionsClient";

export default async function AdminPageSectionsPage() {
  const profile = await requireModule("page_sections", "view");
  const sections = await getAllPageSections("home");

  const canEdit = can(profile.permissions, "page_sections", "edit");

  return <PageSectionsClient sections={sections} canEdit={canEdit} />;
}
