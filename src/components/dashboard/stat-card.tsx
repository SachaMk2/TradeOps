'use client';

import { type LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  valueColor: 'profit' | 'loss' | 'muted' | 'default';
  delta?: number;
  deltaLabel?: string;
}

const colorMap = {
  profit: 'bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground drop-shadow-sm',
  loss: 'bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground drop-shadow-sm',
  muted: 'text-muted-foreground',
  default: 'bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground drop-shadow-sm',
};

export function StatCard({ icon: Icon, label, value, valueColor, delta, deltaLabel }: StatCardProps) {
  return (
    <div className="stat-card glass rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${colorMap[valueColor]}`}>
        {value}
      </p>
      {delta !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {delta >= 0 ? (
            <TrendingUp className="w-3 h-3 text-profit" />
          ) : (
            <TrendingDown className="w-3 h-3 text-loss" />
          )}
          <span className={`text-xs font-medium ${delta >= 0 ? 'text-profit' : 'text-loss'}`}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
          {deltaLabel && (
            <span className="text-xs text-muted-foreground">vs {deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
