import * as FileSystem from 'expo-file-system';

import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function getBase64Value(char: string): number {
  return char === '=' ? 0 : BASE64_CHARS.indexOf(char);
}

function decodeBase64(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/\s/g, '');
  const padding = cleanBase64.endsWith('==') ? 2 : cleanBase64.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array(Math.floor((cleanBase64.length * 3) / 4) - padding);
  let byteIndex = 0;

  for (let i = 0; i < cleanBase64.length; i += 4) {
    const encoded =
      (getBase64Value(cleanBase64[i]) << 18) |
      (getBase64Value(cleanBase64[i + 1]) << 12) |
      (getBase64Value(cleanBase64[i + 2]) << 6) |
      getBase64Value(cleanBase64[i + 3]);

    if (byteIndex < bytes.length) bytes[byteIndex] = (encoded >> 16) & 255;
    byteIndex += 1;
    if (byteIndex < bytes.length) bytes[byteIndex] = (encoded >> 8) & 255;
    byteIndex += 1;
    if (byteIndex < bytes.length) bytes[byteIndex] = encoded & 255;
    byteIndex += 1;
  }

  return bytes.buffer;
}

export async function uploadAvatar(userId: string, uri: string): Promise<string | null> {
  const filePath = `${userId}.jpg`;

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const decoded = decodeBase64(base64);

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, decoded, { upsert: true, contentType: 'image/jpeg' });

    if (error) return null;

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  } catch {
    return null;
  }
}
