"use client";

import TaggedListing from "@/components/TaggedListing";

type Acao = {
  sku: string | number;
  item_id: string;
  produto: string;
  categoria: string;
  problema: string;
  acao_recomendada: string;
  responsavel: string;
  impacto_estimado: string;
  data_criacao: string;
  prioridade: string;
};

const PRIORIDADE_TONE: Record<string, "good" | "warn" | "bad"> = {
  Alta: "bad",
  Média: "warn",
  Baixa: "good"
};

export default function AcoesIaListing({ items }: { items: Acao[] }) {
  return (
    <TaggedListing
      items={items}
      categoriaKey="prioridade"
      tagLabel={(p) => ({ label: p, tone: PRIORIDADE_TONE[p] ?? "neutral" })}
      exportFilename="fila_de_acoes_ia"
      emptyLabel="Nenhuma ação pendente no momento."
      searchKeys={["produto", "sku"]}
      columns={[
        { key: "produto", label: "Produto", value: (a) => a.produto || a.sku, render: (a) => a.produto || a.sku },
        { key: "problema", label: "Problema" },
        { key: "acao_recomendada", label: "Ação recomendada" },
        { key: "responsavel", label: "Responsável" }
      ]}
    />
  );
}
