'use server';

import { revalidatePath } from 'next/cache';
import { type MindDump, type MindDumpInsert, type ActionResult } from '../supabase/types';
import { isDevBypass } from '../mock/bypass';

export async function getMindDumps(): Promise<ActionResult<MindDump[]>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    return { ok: true, data: mockStore.getMindDumps() };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('mind_dumps')
    .select('*')
    .eq('user_id', user.id)
    .order('dump_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as MindDump[] };
}

export async function createMindDump(input: { dump_date: string; content: string; image_urls?: string[] }): Promise<ActionResult<MindDump>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const md = mockStore.createMindDump(input);
    revalidatePath('/mind-dump');
    return { ok: true, data: md };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('mind_dumps').insert({
    user_id: user.id,
    dump_date: input.dump_date,
    content: input.content,
    image_urls: input.image_urls ?? [],
  }).select().single();

  if (error) return { ok: false, error: error.message };

  revalidatePath('/mind-dump');
  return { ok: true, data: data as MindDump };
}

export async function deleteMindDump(id: string): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deleteMindDump(id);
    revalidatePath('/mind-dump');
    return { ok: true, data: undefined };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('mind_dumps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/mind-dump');
  return { ok: true, data: undefined };
}
