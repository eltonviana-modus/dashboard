"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import { formatBRL, formatNumber, formatDateBR } from "@/lib/format";

type VendaDia = { produto: string; sku: string | number; valor: number; pedidos: number };
type VisitaDia = { item_id: string; titulo: string; sku: string | number; visitas: number };

function diaCurto(iso: string) {
  return iso.slice(8, 10) + "/" + iso.slice(5, 7);
}

export default function VendasVisitasDrilldown({
  serieFaturamento,
  serieVisitas,
  vendasPorDia,
  visitasPorDia
}: {
  serieFaturamento: { data: string; faturamento: number }[];
  serieVisitas: { data: string; visitas: number }[];
  vendasPorDia: Record<string, VendaDia[]>;
  visitasPorDia: Record<string, VisitaDia[]>;
}) {
  const ultimoDia = serieFaturamento.length ? serieFaturamento[serieFaturamento.length - 1].data : null;
  const [diaVendas, setDiaVendas] = useState<string | null>(ultimoDia);
  const [diaVisitas, setDiaVisitas] = useState<string | null>(
    serieVisitas.length ? serieVisitas[serieVisitas.length - 1].data : ultimoDia
  );

  const chartVendas = useMemo(
    () => serieFaturamento.map((d) => ({ dia: diaCurto(d.data), diaIso: d.data, valor: d.faturamento })),
    [serieFaturamento]
  );
  const chartVisitas = useMemo(
    () => serieVisitas.map((d) => ({ dia: diaCurto(d.data), diaIso: d.data, valor: d.visitas })),
    [serieVisitas]
  );

  const itensDoDiaVendas = diaVendas ? vendasPorDia[diaVendas] || [] : [];
  const itensDoDiaVisitas = diaVisitas ? visitasPorDia[diaVisitas] || [] : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Section title="Vendas por dia" description={diaVendas ? `Itens vendidos em ${formatDateBR(diaVendas)}` : undefined}>
        {chartVendas.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartVendas}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              onClick={(state: any) => {
                if (state?.activePayload?.[0]?.payload?.diaIso) setDiaVendas(state.activePayload[0].payload.diaIso);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: number) => formatBRL(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} cursor="pointer">
                {chartVendas.map((d) => (
                  <Cell key={d.diaIso} fill={d.diaIso === diaVendas ? "#1d4ed8" : "#93c5fd"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-10 text-center text-sm text-ink-500">Sem vendas registradas no período.</p>
        )}
        <div className="mt-3">
          <SimpleTable
            emptyLabel="Nenhuma venda nesse dia."
            maxHeight="12rem"
            columns={[
              { key: "sku", label: "SKU" },
              { key: "produto", label: "Produto" },
              { key: "pedidos", label: "Pedidos", align: "right" },
              { key: "valor", label: "Faturamento", align: "right" }
            ]}
            rows={itensDoDiaVendas.map((i) => ({
              sku: i.sku,
              produto: i.produto,
              pedidos: i.pedidos,
              valor: formatBRL(i.valor)
            }))}
          />
        </div>
      </Section>

      <Section title="Visitas por dia" description={diaVisitas ? `Produtos visitados em ${formatDateBR(diaVisitas)}` : undefined}>
        {chartVisitas.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartVisitas}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              onClick={(state: any) => {
                if (state?.activePayload?.[0]?.payload?.diaIso) setDiaVisitas(state.activePayload[0].payload.diaIso);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => formatNumber(v)}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} cursor="pointer">
                {chartVisitas.map((d) => (
                  <Cell key={d.diaIso} fill={d.diaIso === diaVisitas ? "#15803d" : "#86efac"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-10 text-center text-sm text-ink-500">Sem visitas registradas no período.</p>
        )}
        <div className="mt-3">
          <SimpleTable
            emptyLabel="Nenhuma visita nesse dia."
            maxHeight="12rem"
            columns={[
              { key: "sku", label: "SKU" },
              { key: "titulo", label: "Produto" },
              { key: "visitas", label: "Visitas", align: "right" }
            ]}
            rows={itensDoDiaVisitas.map((i) => ({
              sku: i.sku,
              titulo: i.titulo,
              visitas: formatNumber(i.visitas)
            }))}
          />
        </div>
      </Section>
    </div>
  );
}
