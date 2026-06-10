// ============================================================
// Mock in-memory data store for dev bypass mode
// ============================================================

import { type Account, type Setup, type ChecklistItem, type Trade, type TradeChecklistItem, type Payout, type Goal, type GoalStatus, type SetupWithChecklist, type TradeWithRelations, type TradingSession, type TradeExecution, type MindDump } from '@/lib/supabase/types';
import { v4, setupIds, sessionIds, tradeIds } from './uuid';

let tradeExecutions: TradeExecution[] = [];

// ---- UUID generator ----
function uuid(): string {
  return v4();
}

const MOCK_USER_ID = 'dev-user-00000000-0000-0000-0000-000000000000';

// ---- IN-MEMORY STORES ----

let accounts: Account[] = [
  {
    id: uuid(), user_id: MOCK_USER_ID, provider_name: 'FTMO', nickname: 'FTMO 100K #1',
    account_size: 100000, challenge_fee: 540, phase: 'eval_p1', position: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    funded_at: null, failed_at: null,
  },
  {
    id: uuid(), user_id: MOCK_USER_ID, provider_name: 'MyFundedFX', nickname: 'MFFX 50K',
    account_size: 50000, challenge_fee: 300, phase: 'eval_p2', position: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    funded_at: null, failed_at: null,
  },
  {
    id: uuid(), user_id: MOCK_USER_ID, provider_name: 'TFT', nickname: 'TFT 200K',
    account_size: 200000, challenge_fee: 950, phase: 'funded', position: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    funded_at: new Date(Date.now() - 30 * 86400000).toISOString(), failed_at: null,
  },
  {
    id: uuid(), user_id: MOCK_USER_ID, provider_name: 'FTMO', nickname: 'FTMO 50K Old',
    account_size: 50000, challenge_fee: 350, phase: 'failed', position: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    funded_at: null, failed_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

let setups: Setup[] = [
  {
    id: setupIds[0], user_id: MOCK_USER_ID, name: 'ICT Silver Bullet',
    description: 'NY session liquidity sweep into FVG with displacement', is_archived: false,
    color_code: '#3b82f6', created_at: new Date().toISOString(),
  },
  {
    id: setupIds[1], user_id: MOCK_USER_ID, name: 'London Breakout',
    description: 'Break of Asian range with volume confirmation', is_archived: false,
    color_code: '#0ea5e9', created_at: new Date().toISOString(),
  },
  {
    id: setupIds[2], user_id: MOCK_USER_ID, name: 'Breaker Block Retest',
    description: 'Retest of breaker block after BOS with bearish OB', is_archived: false,
    color_code: '#6366f1', created_at: new Date().toISOString(),
  },
];

let sessions: TradingSession[] = [
  { id: sessionIds[0], user_id: MOCK_USER_ID, name: 'London Session', created_at: new Date().toISOString() },
  { id: sessionIds[1], user_id: MOCK_USER_ID, name: 'New York Session', created_at: new Date().toISOString() },
  { id: sessionIds[2], user_id: MOCK_USER_ID, name: 'Asian Session', created_at: new Date().toISOString() },
];

let checklistItems: ChecklistItem[] = [
  { id: uuid(), setup_id: setupIds[0], content: 'Time is between 10:00-11:00 AM EST', position: 0, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[0], content: 'Liquidity sweep confirmed (equal highs/lows taken)', position: 1, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[0], content: 'Fair Value Gap present on M15', position: 2, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[0], content: 'Displacement candle closes through FVG', position: 3, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[0], content: 'Entry at 50% of FVG', position: 4, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[1], content: 'Asian range clearly defined', position: 0, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[1], content: 'London session opens with momentum', position: 1, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[1], content: 'Break above/below Asian high/low', position: 2, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[2], content: 'Clear break of structure (BOS)', position: 0, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[2], content: 'Breaker block identified on H1', position: 1, created_at: new Date().toISOString() },
  { id: uuid(), setup_id: setupIds[2], content: 'Price returns to breaker with reaction', position: 2, created_at: new Date().toISOString() },
];

// Generate sample trades over the past 90 days
function generateSampleTrades(): Trade[] {
  const instruments = ['EURUSD', 'XAUUSD', 'NAS100', 'GBPUSD', 'USDJPY'];
  const emotions: Trade['emotional_state'][] = ['calm', 'confident', 'anxious', 'neutral', 'fomo'];
  const mistakes: Trade['mistake_tags'][number][] = ['moved_sl', 'no_confirmation', 'oversize', 'fomo', 'cut_winner_early'];
  const result: Trade[] = [];

  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(Date.now() - daysAgo * 86400000);
    const isWin = Math.random() > 0.4; // 60% win rate
    const pnl = isWin ? Math.random() * 800 + 50 : -(Math.random() * 400 + 20);
    const rMultiple = isWin ? Math.random() * 3 + 0.5 : -(Math.random() * 1.5 + 0.2);
    const setupIdx = Math.floor(Math.random() * setupIds.length);
    const accountIdx = Math.floor(Math.random() * accounts.length);
    const adherence = Math.random() > 0.3 ? Math.floor(Math.random() * 40 + 60) : Math.floor(Math.random() * 60);
    const hasMistakes = Math.random() > 0.5;
    const tradeId = uuid();

    tradeExecutions.push({
      id: uuid(),
      trade_id: tradeId,
      account_id: accounts[accountIdx].id,
      pnl_currency: pnl,
      lot_size: null,
      fees: 0,
      created_at: date.toISOString(),
    });

    result.push({
      id: tradeId,
      user_id: MOCK_USER_ID,
      setup_id: setupIds[setupIdx],
      instrument: instruments[Math.floor(Math.random() * instruments.length)],
      direction: Math.random() > 0.5 ? 'long' : 'short',
      session_id: sessionIds[Math.floor(Math.random() * sessionIds.length)],
      entry_price: 1.1000 + Math.random() * 0.05,
      stop_loss: 1.0950 + Math.random() * 0.02,
      take_profit: 1.1100 + Math.random() * 0.05,
      exit_price: isWin ? 1.1050 + Math.random() * 0.05 : 1.0950 + Math.random() * 0.02,
      planned_rr: Math.random() * 3 + 1,
      executed_rr: rMultiple,
      pnl_r: rMultiple,
      status: 'closed',
      entry_time: date.toISOString(),
      exit_time: new Date(date.getTime() + Math.random() * 3600000 * 4).toISOString(),
      emotional_state: emotions[Math.floor(Math.random() * emotions.length)],
      notes: isWin ? 'Clean execution, followed the plan.' : 'Hesitated on entry, moved SL.',
      screenshot_urls: [],
      adherence_pct: adherence,
      mistake_tags: hasMistakes ? [mistakes[Math.floor(Math.random() * mistakes.length)]] : [],
      created_at: date.toISOString(),
    });
  }

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

let trades: Trade[] = generateSampleTrades();

let tradeChecklistItems: TradeChecklistItem[] = [];

let payouts: Payout[] = [
  {
    id: uuid(), account_id: accounts[2].id, user_id: MOCK_USER_ID,
    amount: 2500, split_percentage: 80, payout_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    notes: 'First payout', created_at: new Date().toISOString(),
  },
];

let goals: Goal[] = [
  {
    id: uuid(), user_id: MOCK_USER_ID, title: 'Pass FTMO 100K Phase 1',
    description: 'Stick to the plan, risk 0.5% per trade.', status: 'active',
    target_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    created_at: new Date().toISOString(), completed_at: null,
  },
];

let mindDumps: MindDump[] = [
  {
    id: uuid(), user_id: MOCK_USER_ID, dump_date: new Date().toISOString().slice(0, 10),
    content: 'Feeling focused today. The market structure shifted on H1. Need to be patient and wait for pullbacks. No chasing breakouts.',
    created_at: new Date().toISOString(),
  }
];

// ---- EXPORTS ----

export const mockStore = {
  getUserId: () => MOCK_USER_ID,

  // ACCOUNTS
  getAccounts: () => [...accounts].sort((a, b) => a.position - b.position),
  createAccount: (input: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    const acc: Account = {
      ...input,
      id: uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    accounts.push(acc);
    return acc;
  },
  updateAccount: (id: string, updates: Partial<Account>) => {
    accounts = accounts.map((a) => a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a);
    return accounts.find((a) => a.id === id)!;
  },
  moveAccount: (id: string, phase: Account['phase'], position: number) => {
    const updates: Partial<Account> = { phase, position };
    if (phase === 'funded') updates.funded_at = new Date().toISOString();
    if (phase === 'failed') updates.failed_at = new Date().toISOString();
    accounts = accounts.map((a) => a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a);
    return accounts.find((a) => a.id === id)!;
  },
  deleteAccount: (id: string) => { accounts = accounts.filter((a) => a.id !== id); },

  // SETUPS
  getSetups: (): SetupWithChecklist[] =>
    setups.map((s) => ({
      ...s,
      checklist_items: checklistItems.filter((ci) => ci.setup_id === s.id).sort((a, b) => a.position - b.position),
    })),
  getSetup: (id: string): SetupWithChecklist | null => {
    const s = setups.find((s) => s.id === id);
    if (!s) return null;
    return { ...s, checklist_items: checklistItems.filter((ci) => ci.setup_id === id).sort((a, b) => a.position - b.position) };
  },
  createSetup: (name: string, description: string, colorCode: string) => {
    const s: Setup = {
      id: uuid(), user_id: MOCK_USER_ID, name, description, is_archived: false,
      color_code: colorCode, created_at: new Date().toISOString(),
    };
    setups.push(s);
    return s;
  },
  updateSetup: (id: string, updates: Partial<Setup>) => {
    setups = setups.map((s) => s.id === id ? { ...s, ...updates } : s);
    return setups.find((s) => s.id === id)!;
  },
  deleteSetup: (id: string) => {
    setups = setups.filter((s) => s.id !== id);
    checklistItems = checklistItems.filter((ci) => ci.setup_id !== id);
  },

  // CHECKLIST ITEMS
  addChecklistItem: (setupId: string, content: string, position: number) => {
    const ci: ChecklistItem = { id: uuid(), setup_id: setupId, content, position, created_at: new Date().toISOString() };
    checklistItems.push(ci);
    return ci;
  },
  updateChecklistItem: (id: string, content: string) => {
    checklistItems = checklistItems.map((ci) => ci.id === id ? { ...ci, content } : ci);
    return checklistItems.find((ci) => ci.id === id)!;
  },
  deleteChecklistItem: (id: string) => { checklistItems = checklistItems.filter((ci) => ci.id !== id); },
  reorderChecklistItems: (items: { id: string; position: number }[]) => {
    for (const { id, position } of items) {
      checklistItems = checklistItems.map((ci) => ci.id === id ? { ...ci, position } : ci);
    }
  },

  // TRADES
  getTrades: (): TradeWithRelations[] =>
    trades.map((t) => ({
      ...t,
      setup: setups.find((s) => s.id === t.setup_id) ?? null,
      session: sessions.find((s) => s.id === t.session_id) ?? null,
      trade_checklist_items: tradeChecklistItems.filter((tci) => tci.trade_id === t.id).sort((a, b) => a.position - b.position),
      trade_executions: tradeExecutions.filter((te) => te.trade_id === t.id).map((te) => ({
        ...te,
        account: accounts.find((a) => a.id === te.account_id) ?? null,
      })),
    })),
  getTrade: (id: string): TradeWithRelations | null => {
    const t = trades.find((t) => t.id === id);
    if (!t) return null;
    return {
      ...t,
      setup: setups.find((s) => s.id === t.setup_id) ?? null,
      session: sessions.find((s) => s.id === t.session_id) ?? null,
      trade_checklist_items: tradeChecklistItems.filter((tci) => tci.trade_id === t.id).sort((a, b) => a.position - b.position),
      trade_executions: tradeExecutions.filter((te) => te.trade_id === t.id).map((te) => ({
        ...te,
        account: accounts.find((a) => a.id === te.account_id) ?? null,
      })),
    };
  },
  logTrade: (
    input: Omit<Trade, 'id' | 'created_at' | 'pnl_currency'>, 
    pnlData: { account_id: string; pnl_currency: number }[],
    snapshot: { content: string; is_respected: boolean; position: number }[]
  ) => {
    const tradeId = uuid();
    const trade: Trade = { 
      ...input, 
      id: tradeId, 
      screenshot_urls: input.screenshot_urls || [],
      created_at: new Date().toISOString() 
    };
    trades.unshift(trade);

    // Create execution mock rows
    for (const pnl of pnlData) {
      tradeExecutions.push({
        id: uuid(),
        trade_id: tradeId,
        account_id: pnl.account_id,
        pnl_currency: pnl.pnl_currency,
        lot_size: null,
        fees: 0,
        created_at: trade.created_at,
      });
    }

    // Freeze checklist snapshot
    for (const item of snapshot) {
      tradeChecklistItems.push({
        id: uuid(),
        trade_id: tradeId,
        content: item.content,
        is_respected: item.is_respected,
        position: item.position,
      });
    }

    return [trade];
  },
  updateTrade: (id: string, updates: Partial<Trade>) => {
    trades = trades.map((t) => t.id === id ? { ...t, ...updates } : t);
    return trades.find((t) => t.id === id)!;
  },
  updateTradeFull: (
    id: string,
    updates: Partial<Trade>,
    pnlData: { account_id: string; pnl_currency: number }[],
    snapshot: { content: string; is_respected: boolean; position: number }[]
  ) => {
    trades = trades.map((t) => t.id === id ? { ...t, ...updates } : t);

    // Update executions
    tradeExecutions = tradeExecutions.filter((te) => te.trade_id !== id);
    for (const pnl of pnlData) {
      tradeExecutions.push({
        id: uuid(),
        trade_id: id,
        account_id: pnl.account_id,
        pnl_currency: pnl.pnl_currency,
        lot_size: null,
        fees: 0,
        created_at: new Date().toISOString(),
      });
    }

    // Update checklist snapshot
    tradeChecklistItems = tradeChecklistItems.filter((tci) => tci.trade_id !== id);
    for (const item of snapshot) {
      tradeChecklistItems.push({
        id: uuid(),
        trade_id: id,
        content: item.content,
        is_respected: item.is_respected,
        position: item.position,
      });
    }

    return trades.find((t) => t.id === id)!;
  },
  deleteTrade: (id: string) => {
    trades = trades.filter((t) => t.id !== id);
    tradeChecklistItems = tradeChecklistItems.filter((tci) => tci.trade_id !== id);
    tradeExecutions = tradeExecutions.filter((te) => te.trade_id !== id);
  },
  updateTradeChecklistItem: (id: string, isRespected: boolean, tradeId: string) => {
    tradeChecklistItems = tradeChecklistItems.map((tci) => tci.id === id ? { ...tci, is_respected: isRespected } : tci);
    const items = tradeChecklistItems.filter((tci) => tci.trade_id === tradeId);
    const adherence = items.length > 0 ? Math.round((items.filter((i) => i.is_respected).length / items.length) * 100) : 100;
    trades = trades.map((t) => t.id === tradeId ? { ...t, adherence_pct: adherence } : t);
    return adherence;
  },

  // PAYOUTS
  getPayouts: (accountId?: string) =>
    accountId ? payouts.filter((p) => p.account_id === accountId) : [...payouts],
  createPayout: (input: { account_id?: string | null; amount: number; split_percentage: number; payout_date: string; notes?: string }) => {
    const p: Payout = {
      id: uuid(), account_id: input.account_id || null, user_id: MOCK_USER_ID,
      amount: input.amount, split_percentage: input.split_percentage, payout_date: input.payout_date, notes: input.notes || '',
      created_at: new Date().toISOString(),
    };
    payouts.push(p);
    return p;
  },
  deletePayout: (id: string) => { payouts = payouts.filter((p) => p.id !== id); },

  // GOALS
  getGoals: () => [...goals],
  createGoal: (input: { title: string; description?: string | null; target_date?: string | null; status: GoalStatus }) => {
    const g: Goal = {
      id: uuid(), user_id: MOCK_USER_ID, title: input.title,
      description: input.description || null, status: input.status,
      target_date: input.target_date || null,
      created_at: new Date().toISOString(), completed_at: null,
    };
    goals.push(g);
    return g;
  },
  updateGoal: (id: string, updates: Partial<Goal>) => {
    let updated = false;
    goals = goals.map((g) => {
      if (g.id === id) {
        updated = true;
        const status = updates.status || g.status;
        const completed_at = status === 'completed' && g.status !== 'completed' ? new Date().toISOString() :
                             status !== 'completed' ? null : g.completed_at;
        return { ...g, ...updates, status, completed_at };
      }
      return g;
    });
    if (!updated) throw new Error('Goal not found');
    return goals.find(g => g.id === id)!;
  },
  deleteGoal: (id: string) => {
    goals = goals.filter((g) => g.id !== id);
  },

  // AGGREGATES
  getLifetimePropROI: () => {
    const totalFees = accounts.reduce((s, a) => s + Number(a.challenge_fee), 0);
    const totalPayouts = payouts.reduce((s, p) => s + Number(p.amount), 0);
    return { totalFees, totalPayouts, roi: totalPayouts - totalFees };
  },

  // SESSIONS
  getSessions: () => [...sessions],
  createSession: (input: { name: string }): TradingSession => {
    const s: TradingSession = {
      id: uuid(), user_id: MOCK_USER_ID, name: input.name, created_at: new Date().toISOString(),
    };
    sessions = [...sessions, s];
    return s;
  },
  updateSession: (id: string, updates: Partial<TradingSession>): TradingSession => {
    sessions = sessions.map(s => s.id === id ? { ...s, ...updates } : s);
    return sessions.find(s => s.id === id)!;
  },
  deleteSession: (id: string) => {
    sessions = sessions.filter(s => s.id !== id);
  },

  // MIND DUMPS
  getMindDumps: () => [...mindDumps].sort((a, b) => new Date(b.dump_date).getTime() - new Date(a.dump_date).getTime()),
  createMindDump: (input: { dump_date: string; content: string }) => {
    const md: MindDump = {
      id: uuid(), user_id: MOCK_USER_ID, dump_date: input.dump_date,
      content: input.content, created_at: new Date().toISOString(),
    };
    mindDumps.push(md);
    return md;
  },
  deleteMindDump: (id: string) => {
    mindDumps = mindDumps.filter((m) => m.id !== id);
  },
};
