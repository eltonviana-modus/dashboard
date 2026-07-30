"use client";

import { useMemo, useState } from "react";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import MotivoBarChart from "@/components/MotivoBarChart";
import Badge from "@/components/Badge";
import { formatDateBR } from "@/lib/format";

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
  prazo_resposta?: string | null;
  turno_resposta?: string | null;
};

// Cor do badge de turno: "Vendedor" é quem o seller precisa agir agora (chama atenção), o
// resto é informativo. Sem turno (null) = ninguém tem ação pendente (ex. devolução em trânsito).
function tonePorTurno(turno: string | null | undefined): "warn" | "neutral" {
  return turno === "Vendedor" ? "warn" : "neutral";
}

export default function ReclamacoesInterativo({
  porProduto,
  porMotivo,
  listaAbertas,
  tipo = "reclamacao"
}: {
  porProduto: ReclamacaoProduto[];
  porMotivo: Record<string, number>;
  listaAbertas: ReclamacaoAberta[];
  /** Só muda os textos exibidos — a lógica é idêntica pra reclamação, devolução e mediação. */
  tipo?: "reclamacao" | "devolucao" | "mediacao";
}) {
  const [produtoSel, setProdutoSel] = useState<string | null>(null);
  const [motivoSel, setMotivoSel] = useState<string | null>(null);

  const rotulo = tipo === "devolucao" ? "Devolução" : tipo === "mediacao" ? "Mediação" : "Reclamação";
  const rotuloPlural = tipo === "devolucao" ? "devoluções" : tipo === "mediacao" ? "mediações" : "reclamações";

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
        description={`${filtrados.length} ${rotuloPlural} em aberto · independente do período selecionado acima${
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
            { key: "status", label: "Status" },
            { key: "prazo_resposta", label: "Prazo de resposta" },
            { key: "turno_resposta", label: "Turno" }
          ]}
          exportRows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "",
            numero_pedido: r.numero_pedido,
            motivo: r.motivo,
            status: r.status,
            prazo_resposta: r.prazo_resposta ?? "",
            turno_resposta: r.turno_resposta ?? ""
          }))}
          columns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" },
            { key: "prazo_resposta", label: "Prazo de resposta" },
            { key: "turno_resposta", label: "Turno" }
          ]}
          rows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "-",
            numero_pedido: r.numero_pedido,
            motivo: r.motivo,
            // Esta listagem só traz itens em aberto (statusFechado filtrado no backend), então
            // o tone é sempre "warn" — o texto do badge (status amigável por estágio) já
            // carrega o detalhe de qual fase está em aberto.
            status: <Badge tone="warn">{r.status}</Badge>,
            prazo_resposta: r.prazo_resposta ? formatDateBR(r.prazo_resposta) : "-",
            turno_resposta: r.turno_resposta ? (
              <Badge tone={tonePorTurno(r.turno_resposta)}>{r.turno_resposta}</Badge>
            ) : (
              "-"
            )
          }))}
        />
      </Section>
    </div>
  );
}
