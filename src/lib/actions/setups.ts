'use server';

import { isDevBypass } from '@/lib/mock/bypass';
import { type ActionResult, type Setup, type ChecklistItem, type SetupWithChecklist } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

// ---- SETUPS ----

export async function getSetups(): Promise<ActionResult<SetupWithChecklist[]>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    return { ok: true, data: mockStore.getSetups() };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data: setups, error } = await supabase
    .from('setups').select('*, checklist_items(*)').eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };

  console.log('GET SETUPS RETRIEVED:', JSON.stringify(setups, null, 2));

  const sorted = (setups ?? []).map((s) => ({
    ...s,
    checklist_items: (s.checklist_items ?? []).sort((a: ChecklistItem, b: ChecklistItem) => a.position - b.position),
  }));
  return { ok: true, data: sorted as SetupWithChecklist[] };
}

export async function getSetup(id: string): Promise<ActionResult<SetupWithChecklist>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const setup = mockStore.getSetup(id);
    if (!setup) return { ok: false, error: 'Not found' };
    return { ok: true, data: setup };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('setups').select('*, checklist_items(*)').eq('id', id).eq('user_id', user.id).single();
  if (error) return { ok: false, error: error.message };

  const sorted = {
    ...data,
    checklist_items: (data.checklist_items ?? []).sort((a: ChecklistItem, b: ChecklistItem) => a.position - b.position),
  };
  return { ok: true, data: sorted as SetupWithChecklist };
}

export async function createSetup(name: string, description: string, colorCode: string): Promise<ActionResult<Setup>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const setup = mockStore.createSetup(name, description, colorCode);
    revalidatePath('/setups');
    return { ok: true, data: setup };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('setups').insert({
    user_id: user.id, name, description, color_code: colorCode,
  }).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/setups');
  revalidatePath('/trades/new');
  return { ok: true, data: data as Setup };
}

export async function updateSetup(id: string, updates: { name?: string; description?: string; color_code?: string; is_archived?: boolean }): Promise<ActionResult<Setup>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const setup = mockStore.updateSetup(id, updates);
    revalidatePath('/setups');
    return { ok: true, data: setup };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('setups').update(updates).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/setups');
  revalidatePath('/trades/new');
  return { ok: true, data: data as Setup };
}

export async function deleteSetup(id: string): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deleteSetup(id);
    revalidatePath('/setups');
    return { ok: true, data: undefined };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.from('setups').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/setups');
  revalidatePath('/trades/new');
  return { ok: true, data: undefined };
}

// ---- CHECKLIST ITEMS ----

export async function addChecklistItem(setupId: string, content: string, position: number): Promise<ActionResult<ChecklistItem>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const item = mockStore.addChecklistItem(setupId, content, position);
    revalidatePath('/setups');
    return { ok: true, data: item };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.from('checklist_items').insert({ setup_id: setupId, content, position }).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/setups');
  revalidatePath('/trades/new');
  return { ok: true, data: data as ChecklistItem };
}

export async function updateChecklistItem(id: string, content: string): Promise<ActionResult<ChecklistItem>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const item = mockStore.updateChecklistItem(id, content);
    revalidatePath('/setups');
    return { ok: true, data: item };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.from('checklist_items').update({ content }).eq('id', id).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/setups');
  revalidatePath('/trades/new');
  return { ok: true, data: data as ChecklistItem };
}

export async function deleteChecklistItem(id: string): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deleteChecklistItem(id);
    revalidatePath('/setups');
    return { ok: true, data: undefined };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { error } = await supabase.from('checklist_items').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/setups');
  return { ok: true, data: undefined };
}

export async function reorderChecklistItems(items: { id: string; position: number }[]): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.reorderChecklistItems(items);
    revalidatePath('/setups');
    return { ok: true, data: undefined };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const updates = items.map(({ id, position }) => supabase.from('checklist_items').update({ position }).eq('id', id));
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath('/setups');
  return { ok: true, data: undefined };
}
