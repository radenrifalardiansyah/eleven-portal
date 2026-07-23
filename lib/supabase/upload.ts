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
