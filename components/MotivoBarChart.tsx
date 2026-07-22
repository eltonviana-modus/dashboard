"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PALETTE = ["#dc2626", "#f97316", "#f59e0b", "#7c3aed", "#2563eb", "#0891b2", "#64748b", "#db2777", "#16a34a"];

export default function MotivoBarChart({
  data,
  selected,
  onSelect,
  emptyLabel = "Nenhum registro no período."
}: {
  data: Record<string, number>;
  /** @deprecated cor única não é mais usada — a pizza usa uma paleta por fatia. Mantido só pra não quebrar chamadas antigas. */
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
    <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 18)}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="total"
          nameKey="motivo"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          cursor={onSelect ? "pointer" : undefined}
          onClick={(d: any) => onSelect && onSelect(d.motivo)}
        >
          {chartData.map((d, i) => (
            <Cell
              key={d.motivo}
              fill={PALETTE[i % PALETTE.length]}
              fillOpacity={selected && selected !== d.motivo ? 0.35 : 1}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
