'use server';

import { isDevBypass } from '@/lib/mock/bypass';
import { type ActionResult } from '@/lib/supabase/types';

export async function uploadScreenshots(formData: FormData): Promise<ActionResult<string[]>> {
  if (isDevBypass()) {
    const count = formData.getAll('files').length;
    return { ok: true, data: Array.from({ length: count }, (_, i) => `https://placeholder.dev/screenshot-${i}.png`) };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const files = formData.getAll('files') as File[];
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('trade-screenshots')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return { ok: false, error: `Upload failed: ${error.message}` };
    }

    const { data: urlData } = supabase.storage
      .from('trade-screenshots')
      .getPublicUrl(fileName);

    urls.push(urlData.publicUrl);
  }

  return { ok: true, data: urls };
}
