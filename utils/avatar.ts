import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';

export async function uploadAvatar(userId: string, uri: string): Promise<string | null> {
  const filePath = `${userId}.jpg`;
  try {
    // fetch() on a local file:// URI returns a proper Blob in React Native —
    // more reliable than manual base64 decode + ArrayBuffer upload.
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });

    if (error) {
      console.error('[uploadAvatar] storage error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    // Cache-bust so the new photo shows immediately
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (e) {
    console.error('[uploadAvatar] caught:', e);
    return null;
  }
}
