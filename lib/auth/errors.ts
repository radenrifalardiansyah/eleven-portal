/**
 * Shared between lib/auth/session.ts (Server Component / Server Action code,
 * pulls in next/headers via lib/supabase/server.ts) and error.tsx (a Client
 * Component boundary) — kept in its own file with zero server-only imports
 * so error.tsx can import it without dragging next/headers into the client
 * bundle.
 */
export const ACCESS_DENIED_MESSAGE = "Anda tidak punya akses untuk melakukan ini.";
