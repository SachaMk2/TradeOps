'use server';

import { isDevBypass } from '@/lib/mock/bypass';
import { type ActionResult, type Trade, type TradeWithRelations } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

export async function logTrade(input: {
  accounts: { account_id: string; pnl_currency: number }[];
  setup_id: string | null; instrument: string;
  direction: 'long' | 'short'; session_id: string | null;
  pnl_r: number | null;
  status: 'open' | 'closed' | 'cancelled'; entry_time: string | null;
  emotional_state: string; notes: string;
  screenshot_urls: string[]; mistake_tags: string[];
  checklist_snapshot: { content: string; is_respected: boolean; position: number }[];
}): Promise<ActionResult<Trade[]>> {
  const snapshot = input.checklist_snapshot;
  let adherencePct = 100;
  if (snapshot.length > 0) {
    const respected = snapshot.filter((item) => item.is_respected).length;
    adherencePct = Math.round((respected / snapshot.length) * 100);
  }

  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const trades = mockStore.logTrade({
      user_id: mockStore.getUserId(),
      setup_id: input.setup_id, instrument: input.instrument, direction: input.direction,
      session_id: input.session_id,
      entry_price: null, stop_loss: null, take_profit: null, exit_price: null,
      planned_rr: null, executed_rr: null, 
      pnl_r: input.pnl_r, status: input.status, entry_time: input.entry_time, exit_time: null,
      emotional_state: input.emotional_state as Trade['emotional_state'],
      notes: input.notes, screenshot_urls: input.screenshot_urls,
      adherence_pct: adherencePct, mistake_tags: input.mistake_tags as Trade['mistake_tags'],
    }, input.accounts, snapshot);
    revalidatePath('/journal');
    revalidatePath('/');
    return { ok: true, data: trades };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const baseTrade = {
    user_id: user.id, setup_id: input.setup_id,
    instrument: input.instrument, direction: input.direction, session_id: input.session_id,
    entry_price: null, stop_loss: null, take_profit: null, exit_price: null,
    planned_rr: null, executed_rr: null, pnl_r: input.pnl_r,
    status: input.status, entry_time: input.entry_time, exit_time: null,
    emotional_state: input.emotional_state, notes: input.notes,
    screenshot_urls: input.screenshot_urls, adherence_pct: adherencePct,
    mistake_tags: input.mistake_tags,
  };

  const { data: trades, error: tradeError } = await supabase.from('trades')
    .insert([baseTrade]).select();
  if (tradeError) return { ok: false, error: tradeError.message };

  const trade = trades[0];

  const executionInserts = input.accounts.map((acc) => ({
    trade_id: trade.id,
    account_id: acc.account_id,
    pnl_currency: acc.pnl_currency,
    lot_size: null,
    fees: 0
  }));

  const { error: execError } = await supabase.from('trade_executions').insert(executionInserts);
  if (execError) return { ok: false, error: execError.message };

  if (snapshot.length > 0 && trades && trades.length > 0) {
    const snapshotRows = [];
    for (const trade of trades) {
      for (const item of snapshot) {
        snapshotRows.push({
          trade_id: trade.id, content: item.content, is_respected: item.is_respected, position: item.position,
        });
      }
    }
    await supabase.from('trade_checklist_items').insert(snapshotRows);
  }

  revalidatePath('/journal');
  revalidatePath('/');
  return { ok: true, data: trades as Trade[] };
}

export async function getTrades(filters?: {
  account_id?: string; setup_id?: string; from_date?: string; to_date?: string;
}): Promise<ActionResult<TradeWithRelations[]>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    let trades = mockStore.getTrades();
    if (filters?.account_id) trades = trades.filter((t) => t.account_id === filters.account_id);
    if (filters?.setup_id) trades = trades.filter((t) => t.setup_id === filters.setup_id);
    return { ok: true, data: trades };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  let query = supabase.from('trades')
    .select('*, trade_executions(*, account:accounts(*)), setup:setups(*), session:trading_sessions(*), trade_checklist_items(*)')
    .eq('user_id', user.id).order('created_at', { ascending: false });

  if (filters?.account_id) {
    // We need to filter trades where any execution belongs to this account.
    // Supabase JS doesn't easily do WHERE EXISTS on child rows in select without inner joins.
    // We can fetch trade_executions and get trade_ids, or use Postgres functions.
    // For now, fetch all executions for this account and filter manually after or use the `!inner` join if possible.
    query = supabase.from('trades')
      .select('*, trade_executions!inner(*, account:accounts(*)), setup:setups(*), session:trading_sessions(*), trade_checklist_items(*)')
      .eq('user_id', user.id).eq('trade_executions.account_id', filters.account_id).order('created_at', { ascending: false });
  }
  if (filters?.setup_id) query = query.eq('setup_id', filters.setup_id);
  if (filters?.from_date) query = query.gte('created_at', filters.from_date);
  if (filters?.to_date) query = query.lte('created_at', filters.to_date);

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as TradeWithRelations[] };
}

export async function getTrade(id: string): Promise<ActionResult<TradeWithRelations>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const trade = mockStore.getTrade(id);
    if (!trade) return { ok: false, error: 'Not found' };
    return { ok: true, data: trade };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data, error } = await supabase.from('trades')
    .select('*, trade_executions(*, account:accounts(*)), setup:setups(*), session:trading_sessions(*), trade_checklist_items(*)')
    .eq('id', id).eq('user_id', user.id).single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as TradeWithRelations };
}

export async function updateTrade(id: string, updates: Partial<Trade>): Promise<ActionResult<Trade>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const trade = mockStore.updateTrade(id, updates);
    revalidatePath('/journal');
    return { ok: true, data: trade };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { id: _id, user_id: _uid, created_at: _ca, ...safeUpdates } = updates;
  const { data, error } = await supabase.from('trades').update(safeUpdates).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { ok: false, error: error.message };

  revalidatePath('/journal');
  return { ok: true, data: data as Trade };
}

export async function updateTradeChecklistItem(id: string, isRespected: boolean, tradeId: string): Promise<ActionResult<{ adherence_pct: number }>> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const adherence = mockStore.updateTradeChecklistItem(id, isRespected, tradeId);
    revalidatePath('/journal');
    return { ok: true, data: { adherence_pct: adherence } };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await supabase.from('trade_checklist_items').update({ is_respected: isRespected }).eq('id', id);
  const { data: allItems } = await supabase.from('trade_checklist_items').select('is_respected').eq('trade_id', tradeId);
  const items = allItems ?? [];
  const adherencePct = items.length > 0 ? Math.round((items.filter((i) => i.is_respected).length / items.length) * 100) : 100;
  await supabase.from('trades').update({ adherence_pct: adherencePct }).eq('id', tradeId);

  revalidatePath('/journal');
  return { ok: true, data: { adherence_pct: adherencePct } };
}

export async function updateTradeFull(
  id: string,
  input: {
    accounts: { account_id: string; pnl_currency: number }[];
    setup_id: string | null;
    instrument: string;
    direction: 'long' | 'short';
    session_id: string | null;
    pnl_r: number | null;
    status: 'open' | 'closed' | 'cancelled';
    entry_time: string | null;
    emotional_state: string;
    notes: string;
    screenshot_urls: string[];
    mistake_tags: string[];
    checklist_snapshot: { content: string; is_respected: boolean; position: number }[];
  }
): Promise<ActionResult<Trade>> {
  const snapshot = input.checklist_snapshot;
  let adherencePct = 100;
  if (snapshot.length > 0) {
    const respected = snapshot.filter((item) => item.is_respected).length;
    adherencePct = Math.round((respected / snapshot.length) * 100);
  }

  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    const trade = mockStore.updateTradeFull(
      id,
      {
        setup_id: input.setup_id,
        instrument: input.instrument,
        direction: input.direction,
        session_id: input.session_id,
        pnl_r: input.pnl_r,
        status: input.status,
        entry_time: input.entry_time,
        emotional_state: input.emotional_state as Trade['emotional_state'],
        notes: input.notes,
        screenshot_urls: input.screenshot_urls,
        adherence_pct: adherencePct,
        mistake_tags: input.mistake_tags as Trade['mistake_tags'],
      },
      input.accounts,
      snapshot
    );
    revalidatePath('/journal');
    revalidatePath('/');
    return { ok: true, data: trade };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  // 1. Update base trade
  const baseTrade = {
    setup_id: input.setup_id,
    instrument: input.instrument,
    direction: input.direction,
    session_id: input.session_id,
    pnl_r: input.pnl_r,
    status: input.status,
    entry_time: input.entry_time,
    emotional_state: input.emotional_state,
    notes: input.notes,
    screenshot_urls: input.screenshot_urls,
    adherence_pct: adherencePct,
    mistake_tags: input.mistake_tags,
  };

  const { data: trades, error: tradeError } = await supabase.from('trades')
    .update(baseTrade).eq('id', id).eq('user_id', user.id).select();
  if (tradeError) return { ok: false, error: tradeError.message };
  if (!trades || trades.length === 0) return { ok: false, error: 'Trade not found' };

  const trade = trades[0];

  // 2. Re-create executions
  const { error: deleteExecError } = await supabase.from('trade_executions').delete().eq('trade_id', id);
  if (deleteExecError) return { ok: false, error: deleteExecError.message };

  const executionInserts = input.accounts.map((acc) => ({
    trade_id: id,
    account_id: acc.account_id,
    pnl_currency: acc.pnl_currency,
    lot_size: null,
    fees: 0
  }));

  const { error: execError } = await supabase.from('trade_executions').insert(executionInserts);
  if (execError) return { ok: false, error: execError.message };

  // 3. Re-create checklist snapshot items
  const { error: deleteChecklistError } = await supabase.from('trade_checklist_items').delete().eq('trade_id', id);
  if (deleteChecklistError) return { ok: false, error: deleteChecklistError.message };

  if (snapshot.length > 0) {
    const snapshotRows = snapshot.map((item) => ({
      trade_id: id,
      content: item.content,
      is_respected: item.is_respected,
      position: item.position,
    }));
    const { error: insertChecklistError } = await supabase.from('trade_checklist_items').insert(snapshotRows);
    if (insertChecklistError) return { ok: false, error: insertChecklistError.message };
  }

  revalidatePath('/journal');
  revalidatePath('/');
  return { ok: true, data: trade as Trade };
}

export async function deleteTrade(id: string): Promise<ActionResult> {
  if (isDevBypass()) {
    const { mockStore } = await import('@/lib/mock/store');
    mockStore.deleteTrade(id);
    revalidatePath('/journal');
    return { ok: true, data: undefined };
  }

  const { createClient, getUser } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.from('trades').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/journal');
  return { ok: true, data: undefined };
}
