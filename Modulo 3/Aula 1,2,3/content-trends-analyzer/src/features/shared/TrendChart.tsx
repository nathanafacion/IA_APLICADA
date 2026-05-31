"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TrendChartProps {
  data: { date: string; value: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sem dados de tendência disponíveis.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="50%" stopColor="#a855f7" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#c084fc" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
            color: "hsl(var(--popover-foreground))",
            boxShadow: "0 8px 30px rgba(139, 92, 246, 0.15)",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#8b5cf6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorValue)"
          name="Interesse"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
