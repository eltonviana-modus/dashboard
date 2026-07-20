"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CampanhasChart({
  data
}: {
  data: { nome: string; disponiveis: number; participando: number }[];
}) {
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-ink-500">Nenhuma campanha encontrada no período.</p>;
  }
  const chartData = data.map((c) => ({
    nome: c.nome.replace(/\s*\((fixo|editável)\)\s*$/i, ""),
    disponiveis: c.disponiveis,
    participando: c.participando
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 32)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nome"
          width={220}
          tick={{ fontSize: 11, fill: "#334155" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="disponiveis" name="Itens elegíveis" fill="#93c5fd" radius={[0, 4, 4, 0]} />
        <Bar dataKey="participando" name="Itens participando" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
