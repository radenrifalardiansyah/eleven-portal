import { requireModule } from "@/lib/auth/session";
import { getRecentLogins } from "@/lib/auth/login-history";
import ProfileForm from "@/components/admin/profile/ProfileForm";

export default async function ProfilePage() {
  const profile = await requireModule("account", "view");
  const loginHistory = await getRecentLogins(profile.id);

  return (
    <div className="space-y-6">
      <ProfileForm
        userId={profile.id}
        email={profile.email ?? ""}
        roleLabel={profile.roleLabel}
        initialFullName={profile.fullName ?? ""}
        initialAvatarUrl={profile.avatarUrl ?? ""}
        initialPhone={profile.phone ?? ""}
        initialPosition={profile.position ?? ""}
        initialBio={profile.bio ?? ""}
        initialTheme={profile.themePreference}
        lastSignInAt={profile.lastSignInAt}
        loginHistory={loginHistory}
      />
    </div>
  );
}
