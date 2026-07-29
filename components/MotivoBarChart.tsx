"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PALETTE = ["#dc2626", "#f97316", "#f59e0b", "#7c3aed", "#2563eb", "#0891b2", "#64748b", "#db2777", "#16a34a"];

const RADIAN = Math.PI / 180;

// Trunca nomes longos pra não estourar a largura do gráfico com muitas fatias.
function truncar(nome: string, max = 26) {
  return nome.length > max ? nome.slice(0, max - 1) + "…" : nome;
}

// Label externo com linha guia (leader line) apontando pra fatia — melhora a leitura quando
// há muitas fatias finas (em vez de espremer o texto dentro da pizza).
function renderLabelExterno(props: any) {
  const { cx, cy, midAngle, outerRadius, name } = props;
  const radius = outerRadius + 14;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#475569" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11}>
      {truncar(String(name))}
    </text>
  );
}

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
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 22)}>
      <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
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
          label={renderLabelExterno}
          labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
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
