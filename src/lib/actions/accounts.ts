'use server';

import { isDevBypass } from '@/lib/mock/bypass';
import { type ActionResult, type Account, type AccountPhase, type Payout } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

export async function getAccounts(): Promise<ActionResult<Account[]>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    return { ok: true, data: mockStore.getAccounts() };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('accounts').select('*').eq('user_id', user.id).order('position', { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as Account[] };
}

export async function createAccount(input: {
  provider_name: string; nickname?: string; account_size: number; challenge_fee: number; phase: AccountPhase;
}): Promise<ActionResult<Account>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const phaseAccounts = mockStore.getAccounts().filter((a) => a.phase === input.phase);
    const acc = mockStore.createAccount({
      user_id: mockStore.getUserId(), provider_name: input.provider_name,
      nickname: input.nickname || null, account_size: input.account_size,
      challenge_fee: input.challenge_fee, phase: input.phase,
      position: phaseAccounts.length, funded_at: null, failed_at: null,
    });
    revalidatePath('/accounts');
    return { ok: true, data: acc };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data: existing } = await supabase.from('accounts').select('position').eq('user_id', user.id).eq('phase', input.phase).order('position', { ascending: false }).limit(1);
  const maxPos = existing?.[0]?.position ?? -1;

  const { data, error } = await supabase.from('accounts').insert({
    user_id: user.id, provider_name: input.provider_name, nickname: input.nickname || null,
    account_size: input.account_size, challenge_fee: input.challenge_fee,
    phase: input.phase, position: maxPos + 1,
  }).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/accounts');
  return { ok: true, data: data as Account };
}

export async function updateAccount(id: string, updates: Partial<Pick<Account, 'provider_name' | 'nickname' | 'account_size' | 'challenge_fee'>>): Promise<ActionResult<Account>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const acc = mockStore.updateAccount(id, updates);
    revalidatePath('/accounts');
    return { ok: true, data: acc };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/accounts');
  return { ok: true, data: data as Account };
}

export async function moveAccount(id: string, newPhase: AccountPhase, newPosition: number): Promise<ActionResult<Account>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const acc = mockStore.moveAccount(id, newPhase, newPosition);
    revalidatePath('/accounts');
    return { ok: true, data: acc };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const updates: Record<string, unknown> = { phase: newPhase, position: newPosition };
  if (newPhase === 'funded') updates.funded_at = new Date().toISOString();
  if (newPhase === 'failed') updates.failed_at = new Date().toISOString();

  const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/accounts');
  return { ok: true, data: data as Account };
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deleteAccount(id);
    revalidatePath('/accounts');
    return { ok: true, data: undefined };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/accounts');
  return { ok: true, data: undefined };
}

// ---- PAYOUTS ----

export async function getPayouts(accountId?: string): Promise<ActionResult<Payout[]>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    return { ok: true, data: mockStore.getPayouts(accountId) };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  let query = supabase.from('payouts').select('*').eq('user_id', user.id).order('payout_date', { ascending: false });
  if (accountId) query = query.eq('account_id', accountId);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as Payout[] };
}

export async function createPayout(input: { account_id?: string | null; amount: number; split_percentage: number; payout_date: string; notes?: string }): Promise<ActionResult<Payout>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const p = mockStore.createPayout(input);
    revalidatePath('/accounts');
    return { ok: true, data: p };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('payouts').insert({
    account_id: input.account_id || null, user_id: user.id, amount: input.amount,
    split_percentage: input.split_percentage, payout_date: input.payout_date, notes: input.notes || '',
  }).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/accounts');
  return { ok: true, data: data as Payout };
}

export async function deletePayout(id: string): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deletePayout(id);
    revalidatePath('/accounts');
    return { ok: true, data: undefined };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.from('payouts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/accounts');
  return { ok: true, data: undefined };
}

export async function getLifetimePropROI(): Promise<ActionResult<{ totalFees: number; totalPayouts: number; roi: number }>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    return { ok: true, data: mockStore.getLifetimePropROI() };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data: accounts } = await supabase.from('accounts').select('challenge_fee').eq('user_id', user.id);
  const { data: payouts } = await supabase.from('payouts').select('amount').eq('user_id', user.id);

  const totalFees = (accounts ?? []).reduce((sum, a) => sum + Number(a.challenge_fee), 0);
  const totalPayouts = (payouts ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return { ok: true, data: { totalFees, totalPayouts, roi: totalPayouts - totalFees } };
}
