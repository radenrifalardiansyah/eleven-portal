"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Called right after a successful sign-in from LoginForm — best-effort,
 *  failures here shouldn't block the user from reaching the dashboard. */
export async function recordLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const userAgent = (await headers()).get("user-agent") ?? null;
  await supabase.from("login_history").insert({ user_id: user.id, user_agent: userAgent });
}
