"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { formatBRL } from "@/lib/format";

export default function RepassesChart({ data }: { data: { data: string; pago: number; previsto: number }[] }) {
  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-ink-500">
        Nenhuma previsão de pagamento disponível ainda — os valores aparecem aqui conforme os pedidos avançam no envio.
      </p>
    );
  }

  const hojeStr = new Date().toISOString().slice(0, 10);
  const formatted = data.map((d) => ({
    dia: d.data.slice(8, 10) + "/" + d.data.slice(5, 7),
    dataIso: d.data,
    pago: d.pago,
    previsto: d.previsto
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${Math.round(v / 1000)}k`}
        />
        <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {formatted.some((d) => d.dataIso === hojeStr) && (
          <ReferenceLine x={hojeStr.slice(8, 10) + "/" + hojeStr.slice(5, 7)} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Hoje", fontSize: 10, fill: "#64748b", position: "top" }} />
        )}
        <Bar dataKey="pago" name="Já pago" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="previsto" name="Previsto" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
