"use client";

import { useMemo, useState } from "react";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import MotivoBarChart from "@/components/MotivoBarChart";
import Badge from "@/components/Badge";

type ReclamacaoProduto = {
  produto: string;
  sku?: string | number;
  total: number;
  motivos: Record<string, number>;
};

type ReclamacaoAberta = {
  produto: string;
  sku?: string | number;
  numero_pedido: string | number;
  motivo: string;
  estagio?: string;
  status: string;
};

export default function ReclamacoesInterativo({
  porProduto,
  porMotivo,
  listaAbertas,
  tipo = "reclamacao"
}: {
  porProduto: ReclamacaoProduto[];
  porMotivo: Record<string, number>;
  listaAbertas: ReclamacaoAberta[];
  /** Só muda os textos exibidos — a lógica é idêntica pra reclamação e devolução. */
  tipo?: "reclamacao" | "devolucao";
}) {
  const [produtoSel, setProdutoSel] = useState<string | null>(null);
  const [motivoSel, setMotivoSel] = useState<string | null>(null);

  const rotulo = tipo === "devolucao" ? "Devolução" : "Reclamação";
  const rotuloPlural = tipo === "devolucao" ? "devoluções" : "reclamações";

  // Top 10 (em vez de 15) pra manter a pizza legível — muitas fatias finas viram ruído visual.
  const topProdutosData = useMemo(() => {
    const ordenado = [...porProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [porProduto]);

  // A listagem sempre mostra TODAS as ocorrências em aberto (com ou sem mediação), independente
  // do período selecionado na página — só os gráficos acima respeitam o filtro de data.
  const filtrados = listaAbertas.filter((r) => {
    if (produtoSel && r.produto !== produtoSel) return false;
    if (motivoSel && r.motivo !== motivoSel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title={`${rotulo} por produto`} description="Top 10 do período · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={topProdutosData}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel={`Nenhuma ${rotuloPlural} no período.`}
          />
        </Section>

        <Section title={`${rotulo} por motivo`} description="Do período · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={porMotivo}
            selected={motivoSel}
            onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))}
            emptyLabel={`Nenhuma ${rotuloPlural} no período.`}
          />
        </Section>
      </div>

      <Section
        title={`Listagem de ${rotuloPlural} em aberto`}
        description={`${filtrados.length} ${rotuloPlural} em aberto (com ou sem mediação) · independente do período selecionado acima${
          produtoSel ? ` · produto: ${produtoSel}` : ""
        }${motivoSel ? ` · motivo: ${motivoSel}` : ""}`}
      >
        <SimpleTable
          key={`${produtoSel ?? "all"}::${motivoSel ?? "all"}`}
          emptyLabel={`Nenhuma ${rotuloPlural} em aberto encontrada com esse filtro.`}
          exportFilename={`${rotuloPlural}_em_aberto`}
          exportColumns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" }
          ]}
          exportRows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "",
            numero_pedido: r.numero_pedido,
            motivo: r.motivo,
            status: r.status
          }))}
          columns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" }
          ]}
          rows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "-",
            numero_pedido: r.numero_pedido,
            motivo: r.motivo,
            status: <Badge tone={r.status === "Aberto" ? "warn" : "good"}>{r.status}</Badge>
          }))}
        />
      </Section>
    </div>
  );
}
