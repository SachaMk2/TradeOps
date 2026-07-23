'use server';

import { revalidatePath } from 'next/cache';
import { type Goal, type GoalInsert, type GoalUpdate, type ActionResult } from '@/lib/supabase/types';
import { isDevBypass } from '@/lib/mock/bypass';

export async function getGoals(): Promise<ActionResult<Goal[]>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    return { ok: true, data: mockStore.getGoals() };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };

  return { ok: true, data: (data ?? []) as Goal[] };
}

export async function createGoal(input: Omit<GoalInsert, 'user_id'>): Promise<ActionResult<Goal>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const goal = mockStore.createGoal(input);
    revalidatePath('/goals');
    return { ok: true, data: goal };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('goals').insert({
    ...input,
    user_id: user.id,
  }).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/goals');
  return { ok: true, data: data as Goal };
}

export async function updateGoal(id: string, updates: GoalUpdate): Promise<ActionResult<Goal>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const goal = mockStore.updateGoal(id, updates);
    revalidatePath('/goals');
    return { ok: true, data: goal };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/goals');
  return { ok: true, data: data as Goal };
}

export async function deleteGoal(id: string): Promise<ActionResult<void>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deleteGoal(id);
    revalidatePath('/goals');
    return { ok: true, data: undefined };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/goals');
  return { ok: true, data: undefined };
}
