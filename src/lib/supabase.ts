import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "rankme-images";

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key);
}

/**
 * Upload a file to Supabase Storage and return its public URL.
 */
export async function uploadImage(
  file: File,
  topicId: string
): Promise<string> {
  const admin = getAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${topicId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 */
export async function deleteImage(publicUrl: string): Promise<void> {
  const admin = getAdminClient();
  const url = new URL(publicUrl);
  const parts = url.pathname.split(`/object/public/${STORAGE_BUCKET}/`);
  if (parts.length < 2) return;
  const filePath = parts[1];
  await admin.storage.from(STORAGE_BUCKET).remove([filePath]);
}
