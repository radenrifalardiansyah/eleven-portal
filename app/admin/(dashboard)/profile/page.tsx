import { requireModule } from "@/lib/auth/session";
import ProfileForm from "@/components/admin/profile/ProfileForm";

export default async function ProfilePage() {
  const profile = await requireModule("account", "view");

  return (
    <div className="space-y-6">
      <ProfileForm email={profile.email ?? ""} role={profile.role} initialFullName={profile.fullName ?? ""} />
    </div>
  );
}
