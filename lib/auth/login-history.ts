import { createClient } from "@/lib/supabase/server";

export type LoginHistoryEntry = {
  id: string;
  createdAt: string;
  device: string;
};

/** Coarse device label from the raw user-agent — good enough for a login
 *  history list, not meant to be a precise UA parser. */
export function detectDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Tidak diketahui";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "Tablet";
  if (/mobile|iphone|android/.test(ua)) return "Mobile";
  return "Desktop";
}

export async function getRecentLogins(userId: string, days = 7): Promise<LoginHistoryEntry[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("login_history")
    .select("id, user_agent, created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    device: detectDeviceLabel(row.user_agent),
  }));
}
