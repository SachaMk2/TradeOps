'use client';

import { type HeatmapDay } from '@/lib/metrics/compute';
import { useMemo } from 'react';
import { format, subDays, startOfWeek, differenceInWeeks, addDays } from 'date-fns';

interface HeatmapProps {
  data: HeatmapDay[];
  useR?: boolean;
}

function getPnlColor(pnl: number, useR: boolean): string {
  if (pnl === 0) return 'bg-border/30';
  if (useR) {
    if (pnl > 0) {
      if (pnl > 3) return 'bg-primary';
      if (pnl > 1.5) return 'bg-primary/70';
      if (pnl > 0.5) return 'bg-primary/40';
      return 'bg-primary/20';
    }
    if (pnl < -1.5) return 'bg-secondary';
    if (pnl < -0.8) return 'bg-secondary/70';
    if (pnl < -0.2) return 'bg-secondary/40';
    return 'bg-secondary/20';
  } else {
    if (pnl > 0) {
      if (pnl > 500) return 'bg-primary';
      if (pnl > 200) return 'bg-primary/70';
      if (pnl > 50) return 'bg-primary/40';
      return 'bg-primary/20';
    }
    if (pnl < -500) return 'bg-secondary';
    if (pnl < -200) return 'bg-secondary/70';
    if (pnl < -50) return 'bg-secondary/40';
    return 'bg-secondary/20';
  }
}

export function Heatmap({ data, useR = false }: HeatmapProps) {
  const dayMap = useMemo(() => {
    const map = new Map<string, HeatmapDay>();
    for (const d of data) {
      map.set(d.date, d);
    }
    return map;
  }, [data]);

  // Build 365-day grid
  const today = new Date();
  const startDate = subDays(today, 364);
  const totalWeeks = differenceInWeeks(today, startOfWeek(startDate, { weekStartsOn: 0 })) + 1;

  const weeks: { date: Date; dayData: HeatmapDay | null }[][] = [];
  let current = startOfWeek(startDate, { weekStartsOn: 0 });

  for (let w = 0; w < totalWeeks; w++) {
    const week: { date: Date; dayData: HeatmapDay | null }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = format(current, 'yyyy-MM-dd');
      const dayData = dayMap.get(dateStr) ?? null;
      week.push({ date: new Date(current), dayData });
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-0.5 min-w-fit">
        {/* Month labels */}
        <div className="flex gap-0.5 pl-8 mb-1">
          {weeks.map((week, i) => {
            const firstDay = week[0]?.date;
            const showLabel = firstDay && firstDay.getDate() <= 7;
            return (
              <div key={i} className="w-3">
                {showLabel && (
                  <span className="text-[9px] text-muted-foreground">
                    {months[firstDay.getMonth()]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 pr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-3 flex items-center">
                <span className="text-[9px] text-muted-foreground w-6 text-right">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(({ date, dayData }, di) => {
                const isInRange = date <= today && date >= startDate;

                if (!isInRange) {
                  return <div key={di} className="w-3 h-3" />;
                }

                const hasTrades = dayData && dayData.count > 0;
                const tooltipText = hasTrades
                  ? `${format(date, 'MMM dd, yyyy')} · ${useR ? dayData.pnl.toFixed(2) + 'R' : '$' + dayData.pnl.toFixed(2)} · ${dayData.count} trade${dayData.count > 1 ? 's' : ''}`
                  : `${format(date, 'MMM dd, yyyy')} · No trades`;

                return (
                  <div
                    key={di}
                    title={tooltipText}
                    className={`
                      w-3 h-3 rounded-[2px] transition-colors cursor-default
                      ${hasTrades ? getPnlColor(dayData.pnl, useR) : 'bg-border/10'}
                      hover:ring-1 hover:ring-foreground/30
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 pl-8">
          <span className="text-[9px] text-muted-foreground">Loss</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-[2px] bg-secondary" />
            <div className="w-3 h-3 rounded-[2px] bg-secondary/70" />
            <div className="w-3 h-3 rounded-[2px] bg-secondary/40" />
            <div className="w-3 h-3 rounded-[2px] bg-secondary/20" />
            <div className="w-3 h-3 rounded-[2px] bg-border/10" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/20" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/40" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/70" />
            <div className="w-3 h-3 rounded-[2px] bg-primary" />
          </div>
          <span className="text-[9px] text-muted-foreground">Profit</span>
        </div>
      </div>
    </div>
  );
}
