"use client";

import TaggedListing from "@/components/TaggedListing";
import { formatDeltaLabel, formatPct } from "@/lib/format";

type Produto = {
  item_id: string;
  sku: string | number;
  titulo: string;
  estoque_disponivel: number;
  visitas_7d: number;
  vendas_7d: number;
  conversao_pct: number;
  categoria: string;
  // Variação de visitas (7 dias vs. os 7 dias anteriores) — só vem preenchida pra quem
  // caiu na categoria "queda_trafego"; é o dado que sustenta essa classificação.
  variacao_visitas_pct?: number;
};

const ANALISE_LABELS: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  muita_visita_sem_venda: { label: "Muita visita sem venda", tone: "warn" },
  sem_visita: { label: "Sem visita", tone: "neutral" },
  queda_trafego: { label: "Queda de tráfego", tone: "warn" },
  ruptura_com_venda: { label: "Ruptura com venda perdida", tone: "bad" }
};

export default function AnaliseVisitasListing({ items }: { items: Produto[] }) {
  return (
    <TaggedListing
      items={items}
      categoriaKey="categoria"
      tagLabel={(cat) => ANALISE_LABELS[cat] ?? { label: cat, tone: "neutral" }}
      exportFilename="analise_de_visitas"
      emptyLabel="Nenhum produto com padrão de atenção no período."
      searchKeys={["titulo", "sku"]}
      columns={[
        { key: "titulo", label: "Produto" },
        { key: "sku", label: "SKU" },
        { key: "estoque_disponivel", label: "Estoque", align: "right" },
        { key: "visitas_7d", label: "Visitas (7d)", align: "right" },
        { key: "vendas_7d", label: "Vendas (7d)", align: "right" },
        {
          key: "conversao_pct",
          label: "Conversão",
          align: "right",
          value: (i) => i.conversao_pct,
          render: (i) => formatPct(i.conversao_pct)
        },
        {
          key: "variacao_visitas_pct",
          label: "Variação de visitas",
          align: "right",
          value: (i) => i.variacao_visitas_pct ?? null,
          render: (i) => {
            if (i.variacao_visitas_pct === undefined || i.variacao_visitas_pct === null) return "-";
            const delta = formatDeltaLabel(i.variacao_visitas_pct);
            return <span className={delta.positive ? "text-good" : "text-bad"}>{delta.text}</span>;
          }
        }
      ]}
    />
  );
}
