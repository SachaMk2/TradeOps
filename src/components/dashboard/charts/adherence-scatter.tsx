'use client';

import { type ScatterPoint } from '@/lib/metrics/compute';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface AdherenceScatterChartProps {
  data: ScatterPoint[];
}

export function AdherenceScatterChart({ data }: AdherenceScatterChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="adherence"
          name="Adherence"
          unit="%"
          tick={{ fontSize: 10, fill: '#888' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
        />
        <YAxis
          dataKey="r"
          name="R-Multiple"
          unit="R"
          tick={{ fontSize: 10, fill: '#888' }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.08 0 0)',
            border: '1px solid oklch(0.15 0 0)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#ebebeb',
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [
            name === 'Adherence' ? `${value}%` : `${Number(value).toFixed(2)}R`,
            String(name),
          ]}
        />
        <Scatter
          data={data}
          fill="#3b82f6"
          fillOpacity={0.7}
          r={5}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
