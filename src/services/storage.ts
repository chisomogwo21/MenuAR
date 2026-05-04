import { supabase } from '../lib/supabase';

export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadFromUrl(bucket: string, path: string, url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'model.glb', { type: 'model/gltf-binary' });
  
  return uploadFile(bucket, path, file);
}
