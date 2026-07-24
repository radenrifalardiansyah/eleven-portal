import { createClient } from "@/lib/supabase/client";

export async function uploadMediaFile(file: File, pathPrefix: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

/** Avatars live in their own bucket, scoped by <uid>/filename — RLS lets
 *  every authenticated user manage their own folder regardless of role,
 *  unlike the "media" bucket which is gated to is_staff_writer(). */
export async function uploadAvatarFile(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
