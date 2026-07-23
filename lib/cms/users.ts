import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
  lastSignInAt: string | null;
};

export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at");
  if (error) throw new Error(error.message);

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) throw new Error(authError.message);

  const authById = new Map(authData.users.map((u) => [u.id, u]));

  return (profiles ?? []).map((p) => {
    const authUser = authById.get(p.id);
    return {
      id: p.id,
      email: authUser?.email ?? null,
      fullName: p.full_name,
      role: p.role,
      createdAt: p.created_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
    };
  });
}
