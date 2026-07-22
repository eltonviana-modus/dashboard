"use client";

import { useMemo, useState } from "react";
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

  // Top 10 (em vez de 15) pra manter a pizza legível — muitas fatias finas viram ruído visual.
  const topProdutosData = useMemo(() => {
    const ordenado = [...porProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [porProduto]);

  const filtrados = porProduto.filter((p) => {
    if (produtoSel && p.produto !== produtoSel) return false;
    if (motivoSel && !(p.motivos[motivoSel] > 0)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Reclamação por produto" description="Top 10 · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={topProdutosData}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel="Nenhuma reclamação no período."
          />
        </Section>

        <Section title="Reclamação por motivo" description="Clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart data={porMotivo} selected={motivoSel} onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))} />
        </Section>
      </div>

      <Section
        title="Listagem de reclamações por produto"
        description={`${filtrados.length} produto(s)${produtoSel ? ` · produto: ${produtoSel}` : ""}${motivoSel ? ` · motivo: ${motivoSel}` : ""}`}
      >
        <SimpleTable
          key={`${produtoSel ?? "all"}::${motivoSel ?? "all"}`}
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
