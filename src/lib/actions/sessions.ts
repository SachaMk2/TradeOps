'use server';

import { createClient } from '@/lib/supabase/server';
import { type TradingSession } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

// Using DEV_BYPASS_AUTH pattern
const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === 'true';

export async function getSessions(): Promise<{ ok: boolean; data?: TradingSession[]; error?: string }> {
  try {
    if (DEV_BYPASS_AUTH) {
      const { mockStore } = await import('@/lib/mock/store');
      return { ok: true, data: mockStore.getSessions() };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('trading_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function createSession(name: string): Promise<{ ok: boolean; data?: TradingSession; error?: string }> {
  try {
    if (DEV_BYPASS_AUTH) {
      const { mockStore } = await import('@/lib/mock/store');
      const s = mockStore.createSession({ name });
      revalidatePath('/settings');
      return { ok: true, data: s };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('trading_sessions')
      .insert({ user_id: user.id, name })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/settings');
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function updateSession(id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (DEV_BYPASS_AUTH) {
      const { mockStore } = await import('@/lib/mock/store');
      mockStore.updateSession(id, { name });
      revalidatePath('/settings');
      return { ok: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('trading_sessions')
      .update({ name })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deleteSession(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (DEV_BYPASS_AUTH) {
      const { mockStore } = await import('@/lib/mock/store');
      mockStore.deleteSession(id);
      revalidatePath('/settings');
      return { ok: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('trading_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/settings');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
