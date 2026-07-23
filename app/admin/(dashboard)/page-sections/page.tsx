import { requireModule } from "@/lib/auth/session";
import ComingSoon from "@/components/admin/ComingSoon";

export default async function AdminPageSectionsPage() {
  await requireModule("page_sections", "view");
  return <ComingSoon title="Page Content" />;
}
