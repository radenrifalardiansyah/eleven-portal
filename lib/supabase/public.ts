import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Anon-only client for public marketing pages and generateStaticParams.
 * Unlike lib/supabase/server.ts, this never touches cookies(), so it also
 * works at build time outside of a request scope.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
