"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RevenueChart({ data }: { data: { data: string; faturamento: number }[] }) {
  const formatted = data.map((d) => ({
    dia: d.data.slice(8, 10) + "/" + d.data.slice(5, 7),
    faturamento: d.faturamento
  }));

  if (!formatted.length) {
    return <p className="py-10 text-center text-sm text-ink-500">Sem vendas registradas no período.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${Math.round(v / 1000)}k`}
        />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Line type="monotone" dataKey="faturamento" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
