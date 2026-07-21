"use client";

import Badge from "@/components/Badge";
import TaggedListing from "@/components/TaggedListing";
import { formatNumber } from "@/lib/format";

type Produto60d = {
  item_id: string;
  sku: string | number;
  titulo: string;
  estoque_disponivel: number;
  giro_60d: number;
  cobertura_dias: number;
  categoria: string;
};

const SAUDE_LABELS: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  em_ruptura: { label: "Em ruptura", tone: "bad" },
  ruptura_iminente: { label: "Ruptura iminente", tone: "bad" },
  critico: { label: "Crítico", tone: "warn" },
  atencao: { label: "Atenção", tone: "warn" },
  sem_vendas: { label: "Sem vendas 60d", tone: "neutral" },
  excedente: { label: "Excedente", tone: "neutral" },
  saudavel: { label: "Saudável", tone: "good" }
};

export default function SaudeEstoqueListing({ items }: { items: Produto60d[] }) {
  return (
    <TaggedListing
      items={items}
      categoriaKey="categoria"
      tagLabel={(cat) => SAUDE_LABELS[cat] ?? { label: cat, tone: "neutral" }}
      exportFilename="saude_de_estoque"
      emptyLabel="Nenhum produto encontrado."
      searchKeys={["titulo", "sku"]}
      columns={[
        { key: "titulo", label: "Produto" },
        { key: "sku", label: "SKU" },
        {
          key: "categoria",
          label: "Situação",
          render: (i) => <Badge tone={SAUDE_LABELS[i.categoria]?.tone ?? "neutral"}>{SAUDE_LABELS[i.categoria]?.label ?? i.categoria}</Badge>
        },
        { key: "estoque_disponivel", label: "Estoque", align: "right" },
        {
          key: "cobertura_dias",
          label: "Cobertura (dias)",
          align: "right",
          value: (i) => (i.cobertura_dias >= 999 ? "" : i.cobertura_dias),
          render: (i) => (i.cobertura_dias >= 999 ? "-" : formatNumber(i.cobertura_dias))
        }
      ]}
    />
  );
}
