"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import MotivoBarChart from "@/components/MotivoBarChart";

type ReclamacaoProduto = {
  produto: string;
  sku?: string | number;
  total: number;
  motivos: Record<string, number>;
};

export default function ReclamacoesInterativo({
  porProduto,
  porMotivo
}: {
  porProduto: ReclamacaoProduto[];
  porMotivo: Record<string, number>;
}) {
  const [produtoSel, setProdutoSel] = useState<string | null>(null);
  const [motivoSel, setMotivoSel] = useState<string | null>(null);

  const topProdutos = useMemo(
    () =>
      [...porProduto]
        .sort((a, b) => b.total - a.total)
        .slice(0, 15)
        .map((p) => ({ produto: p.produto, total: p.total })),
    [porProduto]
  );

  const filtrados = porProduto.filter((p) => {
    if (produtoSel && p.produto !== produtoSel) return false;
    if (motivoSel && !(p.motivos[motivoSel] > 0)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Reclamação por produto" description="Clique numa barra para filtrar a listagem abaixo">
          {topProdutos.length ? (
            <ResponsiveContainer width="100%" height={Math.max(180, topProdutos.length * 28)}>
              <BarChart data={topProdutos} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="produto"
                  width={180}
                  tick={{ fontSize: 10, fill: "#334155" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar
                  dataKey="total"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(d: any) => setProdutoSel((cur) => (cur === d.produto ? null : d.produto))}
                >
                  {topProdutos.map((d) => (
                    <Cell key={d.produto} fill={produtoSel && produtoSel !== d.produto ? "#dc262655" : "#dc2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-ink-500">Nenhuma reclamação no período.</p>
          )}
        </Section>

        <Section title="Reclamação por motivo" description="Clique numa barra para filtrar a listagem abaixo">
          <MotivoBarChart data={porMotivo} selected={motivoSel} onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))} />
        </Section>
      </div>

      <Section
        title="Listagem de reclamações por produto"
        description={`${filtrados.length} produto(s)${produtoSel ? ` · produto: ${produtoSel}` : ""}${motivoSel ? ` · motivo: ${motivoSel}` : ""}`}
      >
        <SimpleTable
          emptyLabel="Nenhuma reclamação encontrada com esse filtro."
          exportFilename="reclamacoes_por_produto"
          exportColumns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "total", label: "Total" },
            { key: "motivos", label: "Motivos" }
          ]}
          exportRows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "",
            total: r.total,
            motivos: Object.entries(r.motivos)
              .sort((a, b) => b[1] - a[1])
              .map(([m, c]) => `${m} (${c})`)
              .join(", ")
          }))}
          columns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "total", label: "Total", align: "right" },
            { key: "motivos", label: "Principais motivos" }
          ]}
          rows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "-",
            total: r.total,
            motivos: Object.entries(r.motivos)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([m, c]) => `${m} (${c})`)
              .join(", ")
          }))}
        />
      </Section>
    </div>
  );
}
