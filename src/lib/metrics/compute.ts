// ============================================================
// TradeOps: Pure Metrics Engine
// All functions are pure — no side effects, no database calls
// ============================================================

import { type Account, type Payout, type Trade, type TradeWithRelations } from '@/lib/supabase/types';

// ---- BASIC METRICS ----

export function netPnl(trades: TradeWithRelations[]): number {
  return trades.reduce((sum, t) => sum + Number(t.pnl_currency), 0);
}

export function winRate(trades: TradeWithRelations[]): number {
  const closed = trades.filter((t) => t.status === 'closed');
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => Number(t.pnl_currency) > 0).length;
  return (wins / closed.length) * 100;
}

export function profitFactor(trades: TradeWithRelations[]): number {
  const closed = trades.filter((t) => t.status === 'closed');
  let grossProfit = 0;
  let grossLoss = 0;

  for (const t of closed) {
    const pnl = Number(t.pnl_currency);
    if (pnl > 0) grossProfit += pnl;
    else grossLoss += Math.abs(pnl);
  }

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export function averageR(trades: TradeWithRelations[]): number {
  const withR = trades.filter((t) => t.pnl_r !== null && t.status === 'closed');
  if (withR.length === 0) return 0;
  return withR.reduce((sum, t) => sum + Number(t.pnl_r), 0) / withR.length;
}

export function expectancyR(trades: TradeWithRelations[]): number {
  const closed = trades.filter((t) => t.pnl_r !== null && t.status === 'closed');
  if (closed.length === 0) return 0;

  const wr = winRate(closed) / 100;
  const wins = closed.filter((t) => Number(t.pnl_r) > 0);
  const losses = closed.filter((t) => Number(t.pnl_r) <= 0);

  const avgWin = wins.length > 0
    ? wins.reduce((s, t) => s + Number(t.pnl_r), 0) / wins.length
    : 0;
  const avgLoss = losses.length > 0
    ? Math.abs(losses.reduce((s, t) => s + Number(t.pnl_r), 0) / losses.length)
    : 0;

  return wr * avgWin - (1 - wr) * avgLoss;
}

export function maxDrawdown(trades: TradeWithRelations[]): number {
  const sorted = [...trades]
    .filter((t) => t.status === 'closed')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let peak = 0;
  let cumPnl = 0;
  let maxDd = 0;

  for (const t of sorted) {
    cumPnl += Number(t.pnl_currency);
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDd) maxDd = dd;
  }

  return maxDd;
}

export function currentStreak(trades: TradeWithRelations[]): { type: 'win' | 'loss' | 'none'; count: number } {
  const sorted = [...trades]
    .filter((t) => t.status === 'closed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (sorted.length === 0) return { type: 'none', count: 0 };

  const firstIsWin = Number(sorted[0].pnl_currency) > 0;
  let count = 0;

  for (const t of sorted) {
    const isWin = Number(t.pnl_currency) > 0;
    if (isWin === firstIsWin) count++;
    else break;
  }

  return { type: firstIsWin ? 'win' : 'loss', count };
}

// ---- PROP ROI ----

export function netPropROI(accounts: Account[], payouts: Payout[]): number {
  const totalFees = accounts.reduce((s, a) => s + Number(a.challenge_fee), 0);
  const totalPayouts = payouts.reduce((s, p) => s + Number(p.amount), 0);
  return totalPayouts - totalFees;
}

// ---- CHART DATA ----

export interface EquityCurvePoint {
  date: string;
  pnl: number;
  cumPnl: number;
}

export function equityCurve(trades: TradeWithRelations[]): EquityCurvePoint[] {
  const sorted = [...trades]
    .filter((t) => t.status === 'closed')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let cumPnl = 0;
  return sorted.map((t) => {
    cumPnl += Number(t.pnl_currency);
    return {
      date: t.created_at,
      pnl: Number(t.pnl_currency),
      cumPnl,
    };
  });
}

export interface PnlByGroup {
  name: string;
  pnl: number;
  count: number;
  color?: string;
}

export function pnlBySetup(trades: TradeWithRelations[], setupMap: Record<string, { name: string; color: string }>): PnlByGroup[] {
  const groups: Record<string, { pnl: number; count: number; color: string }> = {};

  for (const t of trades.filter((t) => t.status === 'closed')) {
    const setupId = t.setup_id ?? 'none';
    const setupInfo = setupMap[setupId] ?? { name: 'No Setup', color: '#666' };
    if (!groups[setupId]) groups[setupId] = { pnl: 0, count: 0, color: setupInfo.color };
    groups[setupId].pnl += Number(t.pnl_currency);
    groups[setupId].count += 1;
  }

  return Object.entries(groups).map(([id, data]) => ({
    name: setupMap[id]?.name ?? 'No Setup',
    pnl: data.pnl,
    count: data.count,
    color: data.color,
  }));
}

export function pnlBySession(trades: TradeWithRelations[], sessionMap: Record<string, { name: string }>): PnlByGroup[] {
  const sessions: Record<string, { pnl: number; count: number }> = {};

  for (const t of trades.filter((t) => t.status === 'closed')) {
    const sessionId = t.session_id ?? 'none';
    if (!sessions[sessionId]) sessions[sessionId] = { pnl: 0, count: 0 };
    sessions[sessionId].pnl += Number(t.pnl_currency);
    sessions[sessionId].count += 1;
  }

  return Object.entries(sessions).map(([id, data]) => ({
    name: sessionMap[id]?.name ?? 'No Session',
    pnl: data.pnl,
    count: data.count,
  }));
}

export interface ScatterPoint {
  adherence: number;
  r: number;
  instrument: string;
}

export function adherenceScatter(trades: TradeWithRelations[]): ScatterPoint[] {
  return trades
    .filter((t) => t.status === 'closed' && t.pnl_r !== null)
    .map((t) => ({
      adherence: Number(t.adherence_pct),
      r: Number(t.pnl_r),
      instrument: t.instrument,
    }));
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  pnl: number;
  count: number;
}

export function calendarHeatmap(trades: TradeWithRelations[]): HeatmapDay[] {
  const dayMap: Record<string, { pnl: number; count: number }> = {};

  for (const t of trades.filter((t) => t.status === 'closed')) {
    const day = t.created_at.split('T')[0];
    if (!dayMap[day]) dayMap[day] = { pnl: 0, count: 0 };
    dayMap[day].pnl += Number(t.pnl_currency);
    dayMap[day].count += 1;
  }

  return Object.entries(dayMap).map(([date, data]) => ({
    date,
    pnl: data.pnl,
    count: data.count,
  }));
}

// ---- 30-DAY DELTA ----

export function pnlDelta30d(trades: TradeWithRelations[]): number {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const last30 = trades.filter((t) => {
    const d = new Date(t.created_at);
    return d >= thirtyDaysAgo && t.status === 'closed';
  });

  const prev30 = trades.filter((t) => {
    const d = new Date(t.created_at);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo && t.status === 'closed';
  });

  const currentPnl = netPnl(last30);
  const prevPnl = netPnl(prev30);

  if (prevPnl === 0) return currentPnl > 0 ? 100 : currentPnl < 0 ? -100 : 0;
  return ((currentPnl - prevPnl) / Math.abs(prevPnl)) * 100;
}
