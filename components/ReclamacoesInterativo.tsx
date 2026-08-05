"use client";

import { useMemo, useState } from "react";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import MotivoBarChart from "@/components/MotivoBarChart";
import Badge from "@/components/Badge";
import TruncateTooltip from "@/components/TruncateTooltip";
import { formatPrazoBR } from "@/lib/format";

type ReclamacaoProduto = {
  produto: string;
  sku?: string | number;
  total: number;
  motivos: Record<string, number>;
};

type ReclamacaoAberta = {
  data_reclamacao?: string | null;
  produto: string;
  sku?: string | number;
  numero_pedido: string | number;
  motivo: string;
  estagio?: string;
  status: string;
  /** false quando o caso já está resolvido (estagio_reclamacao = pos-resolucao no backend). */
  aberto: boolean;
  prazo_resposta?: string | null;
  turno_resposta?: string | null;
  /** Texto explicando a resolução final aplicada pelo ML (só preenchido quando fechada). */
  resolucao?: string | null;
};

// Cor do badge de turno: "Vendedor" é quem o seller precisa agir agora (chama atenção), o
// resto é informativo. Sem turno (null) = ninguém tem ação pendente (ex. devolução em trânsito).
function tonePorTurno(turno: string | null | undefined): "warn" | "neutral" {
  return turno === "Vendedor" ? "warn" : "neutral";
}

export default function ReclamacoesInterativo({
  porProduto,
  porMotivo,
  lista,
  tipo = "reclamacao",
  modo
}: {
  porProduto: ReclamacaoProduto[];
  porMotivo: Record<string, number>;
  lista: ReclamacaoAberta[];
  /** Só muda os textos exibidos — a lógica é idêntica pra reclamação, devolução e mediação. */
  tipo?: "reclamacao" | "devolucao" | "mediacao";
  /** "geral" = fixo, só em aberto, sem filtro de data. "operacao" = histórico (aberto + fechado),
   * dinâmico conforme o período selecionado na página. Pedido do Elton em 2026-07-31. */
  modo: "geral" | "operacao";
}) {
  const [produtoSel, setProdutoSel] = useState<string | null>(null);
  const [motivoSel, setMotivoSel] = useState<string | null>(null);
  const historico = modo === "operacao";

  const rotulo = tipo === "devolucao" ? "Devolução" : tipo === "mediacao" ? "Mediação" : "Reclamação";
  const rotuloPlural = tipo === "devolucao" ? "devoluções" : tipo === "mediacao" ? "mediações" : "reclamações";

  const chartDesc = historico
    ? "Histórico do período selecionado (abertas e fechadas) · clique numa fatia para filtrar a listagem abaixo"
    : "Em aberto, sempre atualizado (sem filtro de data) · clique numa fatia para filtrar a listagem abaixo";

  // Top 10 (em vez de 15) pra manter a pizza legível — muitas fatias finas viram ruído visual.
  const topProdutosData = useMemo(() => {
    const ordenado = [...porProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [porProduto]);

  // Geral: a listagem sempre mostra TODAS as ocorrências em aberto, independente do período
  // selecionado na página. Operação: histórico do período (aberta + fechada), já filtrado por
  // data no backend — só o filtro de produto/motivo é aplicado aqui.
  const filtrados = lista.filter((r) => {
    if (produtoSel && r.produto !== produtoSel) return false;
    if (motivoSel && r.motivo !== motivoSel) return false;
    return true;
  });

  const tituloListagem = historico ? `Histórico de ${rotuloPlural} no período` : `Listagem de ${rotuloPlural} em aberto`;
  const descricaoListagem = `${filtrados.length} ${rotuloPlural} ${
    historico ? "no período selecionado (abertas e fechadas)" : "em aberto · independente do período selecionado acima"
  }${produtoSel ? ` · produto: ${produtoSel}` : ""}${motivoSel ? ` · motivo: ${motivoSel}` : ""}`;
  const emptyLabelListagem = historico
    ? `Nenhuma ${rotuloPlural} encontrada no período com esse filtro.`
    : `Nenhuma ${rotuloPlural} em aberto encontrada com esse filtro.`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title={`${rotulo} por produto`} description={chartDesc}>
          <MotivoBarChart
            data={topProdutosData}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel={historico ? `Nenhuma ${rotuloPlural} no período.` : `Nenhuma ${rotuloPlural} em aberto.`}
          />
        </Section>

        <Section title={`${rotulo} por motivo`} description={chartDesc}>
          <MotivoBarChart
            data={porMotivo}
            selected={motivoSel}
            onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))}
            emptyLabel={historico ? `Nenhuma ${rotuloPlural} no período.` : `Nenhuma ${rotuloPlural} em aberto.`}
          />
        </Section>
      </div>

      <Section title={tituloListagem} description={descricaoListagem}>
        <SimpleTable
          key={`${produtoSel ?? "all"}::${motivoSel ?? "all"}`}
          emptyLabel={emptyLabelListagem}
          exportFilename={historico ? `${rotuloPlural}_historico_periodo` : `${rotuloPlural}_em_aberto`}
          exportColumns={[
            { key: "data_reclamacao", label: "Data da reclamação" },
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" },
            { key: "prazo_resposta", label: "Prazo de resposta" },
            { key: "turno_resposta", label: "Turno" },
            { key: "resolucao", label: "Resolução" }
          ]}
          exportRows={filtrados.map((r) => ({
            data_reclamacao: r.data_reclamacao ? formatPrazoBR(r.data_reclamacao) : "",
            produto: r.produto,
            sku: r.sku ?? "",
            numero_pedido: r.numero_pedido,
            motivo: r.motivo,
            status: r.status,
            prazo_resposta: r.prazo_resposta ?? "",
            turno_resposta: r.turno_resposta ?? "",
            resolucao: r.resolucao ?? ""
          }))}
          columns={[
            { key: "data_reclamacao", label: "Data da reclamação" },
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" },
            { key: "prazo_resposta", label: "Prazo de resposta" },
            { key: "turno_resposta", label: "Turno" },
            { key: "resolucao", label: "Resolução" }
          ]}
          rows={filtrados.map((r) => ({
            data_reclamacao: r.data_reclamacao ? formatPrazoBR(r.data_reclamacao) : "-",
            produto: r.produto,
            sku: r.sku ?? "-",
            numero_pedido: r.numero_pedido,
            motivo: r.motivo,
            // Geral só traz itens em aberto, então o tone é sempre "warn". Operação traz histórico
            // (aberto + fechado) -- usa o campo "aberto" (statusFechado no backend) pra colorir
            // certo os já resolvidos.
            status: <Badge tone={r.aberto ? "warn" : "good"}>{r.status}</Badge>,
            prazo_resposta: r.prazo_resposta ? formatPrazoBR(r.prazo_resposta) : "-",
            turno_resposta: r.turno_resposta ? (
              <Badge tone={tonePorTurno(r.turno_resposta)}>{r.turno_resposta}</Badge>
            ) : (
              "-"
            ),
            // Texto da resolução final costuma ser longo -- trunca e mostra tudo num tooltip ao
            // passar o mouse. Pedido do Elton em 2026-07-31.
            resolucao: <TruncateTooltip text={r.resolucao} />
          }))}
        />
      </Section>
    </div>
  );
}
