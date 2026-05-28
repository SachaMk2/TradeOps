'use client';

import { type PnlByGroup } from '@/lib/metrics/compute';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SetupBarChartProps {
  data: PnlByGroup[];
  useR?: boolean;
}

export function SetupBarChart({ data, useR = false }: SetupBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
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
          formatter={(value: any) => [useR ? `${Number(value).toFixed(2)}R` : `$${Number(value).toFixed(2)}`, 'P&L']}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.color || (entry.pnl >= 0 ? '#3b82f6' : '#475569')}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
