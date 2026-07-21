"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function MotivoBarChart({
  data,
  color = "#dc2626",
  selected,
  onSelect,
  emptyLabel = "Nenhum registro no período."
}: {
  data: Record<string, number>;
  color?: string;
  selected?: string | null;
  onSelect?: (motivo: string) => void;
  emptyLabel?: string;
}) {
  const chartData = Object.entries(data)
    .filter(([, total]) => total > 0)
    .map(([motivo, total]) => ({ motivo, total }))
    .sort((a, b) => b.total - a.total);

  if (!chartData.length) {
    return <p className="py-10 text-center text-sm text-ink-500">{emptyLabel}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 36)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="motivo"
          width={220}
          tick={{ fontSize: 11, fill: "#334155" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Bar
          dataKey="total"
          radius={[0, 4, 4, 0]}
          cursor={onSelect ? "pointer" : undefined}
          onClick={(d: any) => onSelect && onSelect(d.motivo)}
        >
          {chartData.map((d) => (
            <Cell key={d.motivo} fill={selected && selected !== d.motivo ? `${color}55` : color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
