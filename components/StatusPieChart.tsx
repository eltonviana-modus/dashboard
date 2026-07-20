"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PALETTE = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#64748b", "#db2777"];

export default function StatusPieChart({
  data,
  colorMap
}: {
  data: Record<string, number>;
  colorMap?: Record<string, string>;
}) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (!entries.length) {
    return <p className="py-10 text-center text-sm text-ink-500">Sem dados no período.</p>;
  }
  const chartData = entries.map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={colorMap?.[entry.name] || PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
