'use client';

import { type EquityCurvePoint } from '@/lib/metrics/compute';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface EquityChartProps {
  data: EquityCurvePoint[];
  useR?: boolean;
}

export function EquityChart({ data, useR = false }: EquityChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No closed trades yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.date), 'MMM dd'),
    cumPnl: d.cumPnl,
  }));

  const isPositive = chartData[chartData.length - 1]?.cumPnl >= 0;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#888' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#888' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => useR ? `${value}R` : `$${value}`}
        />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.08 0 0)',
            border: '1px solid oklch(0.15 0 0)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#ebebeb',
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [useR ? `${Number(value).toFixed(2)}R` : `$${Number(value).toFixed(2)}`, 'Cumulative P&L']}
        />
        <Area
          type="monotone"
          dataKey="cumPnl"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#equityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
