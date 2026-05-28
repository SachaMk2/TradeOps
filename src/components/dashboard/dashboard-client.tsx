'use client';

import { useMemo, useState } from 'react';
import { type TradeWithRelations, type Account, type Payout, type SetupWithChecklist, type TradingSession } from '@/lib/supabase/types';
import {
  netPnl,
  winRate,
  profitFactor,
  averageR,
  expectancyR,
  maxDrawdown,
  currentStreak,
  netPropROI,
  equityCurve,
  pnlBySetup,
  pnlBySession,
  adherenceScatter,
  calendarHeatmap,
  pnlDelta30d,
} from '@/lib/metrics/compute';
import { subDays, isAfter, parseISO } from 'date-fns';
import { StatCard } from './stat-card';
import { EquityChart } from './charts/equity-chart';
import { SetupBarChart } from './charts/setup-bar-chart';
import { SessionBarChart } from './charts/session-bar-chart';
import { AdherenceScatterChart } from './charts/adherence-scatter';
import { Heatmap } from './charts/heatmap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowDownRight,
  Flame,
  PiggyBank,
} from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatValue(value: number, isR: boolean) {
  if (isR) return `${value.toFixed(2)}R`;
  return formatCurrency(value);
}

interface DashboardClientProps {
  trades: TradeWithRelations[];
  accounts: Account[];
  payouts: Payout[];
  setups: SetupWithChecklist[];
  sessions: TradingSession[];
}

export function DashboardClient({ trades, accounts, payouts, setups, sessions }: DashboardClientProps) {
  const [dateRange, setDateRange] = useState('90');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterSetup, setFilterSetup] = useState('all');
  const [useR, setUseR] = useState(false);

  const filteredTrades = useMemo(() => {
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return trades.filter((t) => {
      const matchAccount = filterAccount === 'all' || (t.trade_executions && t.trade_executions.some(e => e.account_id === filterAccount));
      const matchSetup = filterSetup === 'all' || t.setup_id === filterSetup;
      const matchDate = dateRange === '9999' || isAfter(parseISO(t.created_at), cutoff);
      return matchAccount && matchSetup && matchDate;
    }).map(t => {
      // Calculate dynamic PnL based on filter
      let pnl = 0;
      if (t.trade_executions) {
        if (filterAccount !== 'all') {
          pnl = Number(t.trade_executions.find(e => e.account_id === filterAccount)?.pnl_currency || 0);
        } else {
          pnl = t.trade_executions.reduce((sum, e) => sum + Number(e.pnl_currency), 0);
        }
      }
      return {
        ...t,
        pnl_currency: pnl
      };
    });
  }, [trades, filterAccount, filterSetup, dateRange]);

  const setupMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    for (const s of setups) {
      map[s.id] = { name: s.name, color: s.color_code };
    }
    return map;
  }, [setups]);

  const sessionMap = useMemo(() => {
    const map: Record<string, { name: string }> = {};
    for (const s of sessions) {
      map[s.id] = { name: s.name };
    }
    return map;
  }, [sessions]);

  // Create an overridden copy of trades for R-multiple mode
  const dataTrades = useMemo(() => {
    if (!useR) return filteredTrades;
    return filteredTrades.map(t => ({
      ...t,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pnl_currency: (t.pnl_r !== null ? Number(t.pnl_r) : 0) as any,
    }));
  }, [filteredTrades, useR]);

  // Compute all metrics
  const metrics = useMemo(() => ({
    netPnl: netPnl(dataTrades),
    winRate: winRate(dataTrades),
    profitFactor: profitFactor(dataTrades),
    propROI: netPropROI(accounts, payouts),
    avgR: averageR(dataTrades), // Note: avgR might compound if we aren't careful, but averageR specifically uses pnl_r anyway!
    expectancy: expectancyR(dataTrades), // Uses pnl_r specifically
    maxDd: maxDrawdown(dataTrades),
    streak: currentStreak(dataTrades),
    pnlDelta: pnlDelta30d(dataTrades),
    equity: equityCurve(dataTrades),
    setupPnl: pnlBySetup(dataTrades, setupMap),
    sessionPnl: pnlBySession(dataTrades, sessionMap),
    scatter: adherenceScatter(dataTrades),
    heatmap: calendarHeatmap(dataTrades),
  }), [dataTrades, accounts, payouts, setupMap]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
          <SelectTrigger className="w-40 bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="9999">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAccount} onValueChange={(v) => v && setFilterAccount(v)}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nickname || a.provider_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSetup} onValueChange={(v) => v && setFilterSetup(v)}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="All Setups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Setups</SelectItem>
            {setups.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto bg-background/50 p-1 rounded-lg border border-border flex items-center shadow-sm relative overflow-hidden">
          <div
            className={`absolute inset-y-1 w-[80px] bg-primary rounded-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${useR ? 'translate-x-[80px]' : 'translate-x-0'}`}
          />
          <button
            onClick={() => setUseR(false)}
            className={`relative z-10 w-[80px] px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${!useR ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            $ USD
          </button>
          <button
            onClick={() => setUseR(true)}
            className={`relative z-10 w-[80px] px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${useR ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            R-Mult
          </button>
        </div>
      </div>

      {/* Row 1: Primary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Net P&L"
          value={formatValue(metrics.netPnl, useR)}
          valueColor={metrics.netPnl >= 0 ? 'profit' : 'loss'}
          delta={metrics.pnlDelta}
          deltaLabel="30d"
        />
        <StatCard
          icon={Target}
          label="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          valueColor={metrics.winRate >= 50 ? 'profit' : 'loss'}
        />
        <StatCard
          icon={BarChart3}
          label="Profit Factor"
          value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          valueColor={metrics.profitFactor >= 1 ? 'profit' : 'loss'}
        />
        <StatCard
          icon={PiggyBank}
          label="Net Prop ROI"
          value={formatCurrency(metrics.propROI)}
          valueColor={metrics.propROI >= 0 ? 'profit' : 'loss'}
        />
      </div>

      {/* Row 2: Secondary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Average R"
          value={`${metrics.avgR.toFixed(2)}R`}
          valueColor={metrics.avgR >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          icon={Zap}
          label="Expectancy"
          value={`${metrics.expectancy.toFixed(2)}R`}
          valueColor={metrics.expectancy >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          icon={ArrowDownRight}
          label="Max Drawdown"
          value={formatValue(metrics.maxDd, useR)}
          valueColor="loss"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={metrics.streak.count > 0 ? `${metrics.streak.count} ${metrics.streak.type === 'win' ? 'W' : 'L'}` : '—'}
          valueColor={metrics.streak.type === 'win' ? 'profit' : metrics.streak.type === 'loss' ? 'loss' : 'muted'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Equity Curve</h3>
          <EquityChart data={metrics.equity} useR={useR} />
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">P&L by Setup</h3>
          <SetupBarChart data={metrics.setupPnl} useR={useR} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">P&L by Session</h3>
          <SessionBarChart data={metrics.sessionPnl} useR={useR} />
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Adherence vs R-Multiple</h3>
          <AdherenceScatterChart data={metrics.scatter} />
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Trading Activity</h3>
        <Heatmap data={metrics.heatmap} useR={useR} />
      </div>
    </div>
  );
}
