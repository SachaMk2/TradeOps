'use client';

import { useState, useMemo } from 'react';
import { type TradeWithRelations } from '@/lib/supabase/types';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarClientProps {
  trades: TradeWithRelations[];
}

interface DayStats {
  date: string; // YYYY-MM-DD
  trades: TradeWithRelations[];
  totalRR: number;
  winRate: number;
  tradeCount: number;
  wins: number;
  losses: number;
}

interface CalendarDay {
  isPadding: boolean;
  dateKey?: string;
  dayNum?: number;
  stat?: DayStats | null;
}

function toLocalDateKey(trade: TradeWithRelations): string {
  const d = new Date(trade.entry_time || trade.created_at);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function computeDayStats(trades: TradeWithRelations[]): Map<string, DayStats> {
  const map = new Map<string, DayStats>();

  for (const trade of trades) {
    if (trade.status !== 'closed') continue;
    const key = toLocalDateKey(trade);

    if (!map.has(key)) {
      map.set(key, {
        date: key,
        trades: [],
        totalRR: 0,
        winRate: 0,
        tradeCount: 0,
        wins: 0,
        losses: 0,
      });
    }

    const day = map.get(key)!;
    day.trades.push(trade);
    day.tradeCount++;

    const pnlR = trade.pnl_r ? Number(trade.pnl_r) : null;
    if (pnlR !== null) {
      day.totalRR += pnlR;
      if (pnlR >= 0) day.wins++;
      else if (pnlR < 0) day.losses++;
    }
  }

  for (const [, day] of map) {
    const decidedTrades = day.wins + day.losses;
    day.winRate = decidedTrades > 0 ? Math.round((day.wins / decidedTrades) * 100) : 0;
  }

  return map;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarClient({ trades }: CalendarClientProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<DayStats | null>(null);

  const dayStats = useMemo(() => computeDayStats(trades), [trades]);

  // Build calendar grid
  const { days, monthStats } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // ISO week: Monday = 0, Sunday = 6
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];
    for (let i = 0; i < startOffset; i++) days.push({ isPadding: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        isPadding: false,
        dateKey: key,
        dayNum: d,
        stat: dayStats.get(key) ?? null,
      });
    }

    // Pad to full weeks
    while (days.length % 7 !== 0) days.push({ isPadding: true });

    // Month aggregate stats
    let totalRR = 0, wins = 0, losses = 0, tradeCount = 0;
    for (const [key, stat] of dayStats) {
      if (key.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        totalRR += stat.totalRR;
        wins += stat.wins;
        losses += stat.losses;
        tradeCount += stat.tradeCount;
      }
    }
    const monthStats = {
      totalRR,
      winRate: (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0,
      tradeCount,
      tradingDays: Array.from(dayStats.keys()).filter(k =>
        k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
      ).length,
    };

    return { days, monthStats };
  }, [year, month, dayStats]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function getDayBg(stat: DayStats | null): string {
    if (!stat || stat.tradeCount === 0) return '';
    if (stat.totalRR > 0) return 'bg-profit/10 border-profit/30 hover:bg-profit/20';
    if (stat.totalRR < 0) return 'bg-loss/10 border-loss/30 hover:bg-loss/20';
    return 'bg-muted/30 border-border/50 hover:bg-muted/50';
  }

  function getRRColor(rr: number): string {
    if (rr > 0) return 'text-profit text-glow-profit';
    if (rr < 0) return 'text-loss text-glow-loss';
    return 'text-muted-foreground';
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Month Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total R',
            value: monthStats.totalRR >= 0
              ? `+${monthStats.totalRR.toFixed(2)}R`
              : `${monthStats.totalRR.toFixed(2)}R`,
            color: monthStats.totalRR >= 0 ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss',
          },
          {
            label: 'Win Rate',
            value: `${monthStats.winRate}%`,
            color: monthStats.winRate >= 50 ? 'text-profit' : 'text-loss',
          },
          {
            label: 'Trades',
            value: monthStats.tradeCount.toString(),
            color: 'text-foreground',
          },
          {
            label: 'Trading Days',
            value: monthStats.tradingDays.toString(),
            color: 'text-primary',
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 stat-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="glass rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-muted/50">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight">{MONTH_NAMES[month]} {year}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-muted/50">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((dayObj, i) => {
            if (dayObj.isPadding) {
              return <div key={`pad-${i}`} className="aspect-square" />;
            }

            const { stat, dayNum, dateKey } = dayObj;
            const isToday = dateKey === todayKey;
            const isEmpty = !stat || stat.tradeCount === 0;
            const bgClass = getDayBg(stat || null);

            return (
              <button
                key={i}
                onClick={() => stat && stat.tradeCount > 0 && setSelectedDay(stat === selectedDay ? null : stat)}
                className={`
                  relative aspect-square rounded-xl border transition-all duration-200 p-1.5 text-left
                  ${isEmpty
                    ? `border-border/20 bg-background/30 ${isToday ? 'border-primary/50 ring-1 ring-primary/30' : ''}`
                    : `border ${bgClass} cursor-pointer ${stat === selectedDay ? 'ring-2 ring-primary/60' : ''}`
                  }
                `}
              >
                {/* Day number */}
                <span className={`
                  text-[10px] font-semibold leading-none
                  ${isToday ? 'text-primary' : isEmpty ? 'text-muted-foreground/40' : 'text-muted-foreground'}
                `}>
                  {dayNum}
                </span>

                {stat && stat.tradeCount > 0 && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {/* RR */}
                    <span className={`text-[11px] font-bold leading-none font-mono ${getRRColor(stat.totalRR)}`}>
                      {stat.totalRR >= 0 ? '+' : ''}{stat.totalRR.toFixed(1)}R
                    </span>
                    {/* Win rate */}
                    <span className="text-[9px] text-muted-foreground leading-none">
                      {stat.winRate}% · {stat.tradeCount}T
                    </span>
                  </div>
                )}

                {/* Today indicator */}
                {isToday && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-profit/20 border border-profit/30" />
            <span className="text-xs text-muted-foreground">Profitable day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-loss/20 border border-loss/30" />
            <span className="text-xs text-muted-foreground">Losing day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted/30 border border-border/50" />
            <span className="text-xs text-muted-foreground">Breakeven</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="glass rounded-xl p-6 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDay.tradeCount} trade{selectedDay.tradeCount !== 1 ? 's' : ''} · {selectedDay.wins}W / {selectedDay.losses}L
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold font-mono ${getRRColor(selectedDay.totalRR)}`}>
                {selectedDay.totalRR >= 0 ? '+' : ''}{selectedDay.totalRR.toFixed(2)}R
              </p>
              <p className={`text-sm font-medium ${selectedDay.winRate >= 50 ? 'text-profit' : 'text-loss'}`}>
                {selectedDay.winRate}% win rate
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedDay.trades.map((trade) => {
              const pnlR = trade.pnl_r ? Number(trade.pnl_r) : null;
              const isWin = pnlR !== null && pnlR > 0;
              const isLoss = pnlR !== null && pnlR < 0;
              const pnlCurrency = trade.trade_executions
                ? trade.trade_executions.reduce((sum, e) => sum + Number(e.pnl_currency), 0)
                : 0;

              return (
                <div
                  key={trade.id}
                  className={`
                    flex items-center justify-between rounded-lg px-3 py-2.5 border
                    ${isWin ? 'bg-profit/5 border-profit/20' : isLoss ? 'bg-loss/5 border-loss/20' : 'bg-muted/20 border-border/30'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {trade.direction === 'long'
                      ? <TrendingUp className="w-4 h-4 text-profit shrink-0" />
                      : <TrendingDown className="w-4 h-4 text-loss shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-semibold">{trade.instrument}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.entry_time
                          ? new Date(trade.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'
                        }
                        {trade.setup && <span className="ml-1">· {(trade as any).setup?.name}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {pnlR !== null ? (
                      <p className={`text-sm font-bold font-mono ${getRRColor(pnlR)}`}>
                        {pnlR >= 0 ? '+' : ''}{pnlR.toFixed(2)}R
                      </p>
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground ml-auto" />
                    )}
                    {pnlCurrency !== 0 && (
                      <p className={`text-xs ${pnlCurrency >= 0 ? 'text-profit/70' : 'text-loss/70'}`}>
                        {pnlCurrency >= 0 ? '+' : ''}${Math.abs(pnlCurrency).toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
