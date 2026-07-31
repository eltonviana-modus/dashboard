"use client";

import { useMemo, useState } from "react";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import MotivoBarChart from "@/components/MotivoBarChart";
import Badge from "@/components/Badge";
import { formatPrazoBR } from "@/lib/format";
import type { ReclamacaoListaItem } from "@/lib/api";

type ReclamacaoProduto = {
  produto: string;
  sku?: string | number;
  total: number;
  motivos: Record<string, number>;
};

// Cor do badge de turno: "Vendedor" é quem o seller precisa agir agora (chama atenção), o
// resto é informativo. Sem turno (null) = ninguém tem ação pendente (ex. devolução em trânsito).
function tonePorTurno(turno: string | null | undefined): "warn" | "neutral" {
  return turno === "Vendedor" ? "warn" : "neutral";
}

function toneTipo(tipo: string): "neutral" | "warn" {
  return tipo === "Devolução" ? "warn" : "neutral";
}

/**
 * Reclamação (nível 1: produto + motivo) e devolução (um resultado possível da reclamação, não
 * uma categoria irmã) têm gráficos separados, mas a listagem embaixo é UMA SÓ, coberta pela
 * coluna "Tipo", pra não duplicar o mesmo pedido (uma venda pode transicionar de reclamação pra
 * devolução sem gerar uma segunda linha). Pedido do Elton em 2026-07-30.
 *
 * `modo` controla se esse bloco é a versão fixa (aba Geral: só casos em aberto, sem filtro de
 * data) ou a versão histórica (aba Operação: aberto + fechado, dinâmico conforme o período
 * selecionado) — mesmo componente, fonte de dados e textos diferentes. Pedido do Elton em
 * 2026-07-31: a aba Operação estava sempre mostrando só abertas, ignorando o filtro de data.
 */
export default function ReclamacoesDevolucoesInterativo({
  reclamacaoPorProduto,
  reclamacaoPorMotivo,
  devolucaoPorProduto,
  devolucaoPorMotivo,
  lista,
  modo
}: {
  reclamacaoPorProduto: ReclamacaoProduto[];
  reclamacaoPorMotivo: Record<string, number>;
  devolucaoPorProduto: ReclamacaoProduto[];
  devolucaoPorMotivo: Record<string, number>;
  lista: ReclamacaoListaItem[];
  /** "geral" = fixo, só em aberto, sem filtro de data. "operacao" = histórico (aberto + fechado),
   * dinâmico conforme o período selecionado na página. */
  modo: "geral" | "operacao";
}) {
  const [produtoSel, setProdutoSel] = useState<string | null>(null);
  const [motivoSel, setMotivoSel] = useState<string | null>(null);
  const historico = modo === "operacao";
  const chartDesc = historico
    ? "Histórico do período selecionado (abertos e fechados) · clique numa fatia para filtrar a listagem abaixo"
    : "Em aberto, sempre atualizado (sem filtro de data) · clique numa fatia para filtrar a listagem abaixo";

  // Top 10 (em vez de 15) pra manter a pizza legível — muitas fatias finas viram ruído visual.
  const topReclamacaoProduto = useMemo(() => {
    const ordenado = [...reclamacaoPorProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [reclamacaoPorProduto]);

  const topDevolucaoProduto = useMemo(() => {
    const ordenado = [...devolucaoPorProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [devolucaoPorProduto]);

  // Geral: a listagem sempre mostra TODAS as ocorrências em aberto, independente do período
  // selecionado na página. Operação: a listagem é o histórico do período (aberto + fechado) --
  // já vem filtrada por data do backend, só o filtro de produto/motivo é aplicado aqui.
  const filtrados = lista.filter((r) => {
    if (produtoSel && r.produto !== produtoSel) return false;
    if (motivoSel && r.motivo !== motivoSel) return false;
    return true;
  });

  const tituloListagem = historico
    ? "Histórico de reclamações e devoluções no período"
    : "Listagem de reclamações e devoluções em aberto";
  const descricaoListagem = `${filtrados.length} ${historico ? "no período selecionado (abertos e fechados)" : "em aberto · independente do período selecionado acima"}${
    produtoSel ? ` · produto: ${produtoSel}` : ""
  }${motivoSel ? ` · motivo: ${motivoSel}` : ""}`;
  const emptyLabelListagem = historico
    ? "Nenhuma reclamação ou devolução encontrada no período com esse filtro."
    : "Nenhuma reclamação ou devolução em aberto encontrada com esse filtro.";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Reclamação por produto" description={chartDesc}>
          <MotivoBarChart
            data={topReclamacaoProduto}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel={historico ? "Nenhuma reclamação no período." : "Nenhuma reclamação em aberto."}
          />
        </Section>

        <Section title="Reclamação por motivo" description={chartDesc}>
          <MotivoBarChart
            data={reclamacaoPorMotivo}
            selected={motivoSel}
            onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))}
            emptyLabel={historico ? "Nenhuma reclamação no período." : "Nenhuma reclamação em aberto."}
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Devolução por produto" description={chartDesc}>
          <MotivoBarChart
            data={topDevolucaoProduto}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel={historico ? "Nenhuma devolução no período." : "Nenhuma devolução em aberto."}
          />
        </Section>

        <Section title="Devolução por motivo" description={chartDesc}>
          <MotivoBarChart
            data={devolucaoPorMotivo}
            selected={motivoSel}
            onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))}
            emptyLabel={historico ? "Nenhuma devolução no período." : "Nenhuma devolução em aberto."}
          />
        </Section>
      </div>

      <Section title={tituloListagem} description={descricaoListagem}>
        <SimpleTable
          key={`${produtoSel ?? "all"}::${motivoSel ?? "all"}`}
          emptyLabel={emptyLabelListagem}
          exportFilename={historico ? "reclamacoes_devolucoes_historico_periodo" : "reclamacoes_devolucoes_em_aberto"}
          exportColumns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "tipo", label: "Tipo" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" },
            { key: "prazo_resposta", label: "Prazo de resposta" },
            { key: "turno_resposta", label: "Turno" }
          ]}
          exportRows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "",
            numero_pedido: r.numero_pedido,
            tipo: r.tipo,
            motivo: r.motivo,
            status: r.status,
            prazo_resposta: r.prazo_resposta ?? "",
            turno_resposta: r.turno_resposta ?? ""
          }))}
          columns={[
            { key: "produto", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "numero_pedido", label: "Nº da venda" },
            { key: "tipo", label: "Tipo" },
            { key: "motivo", label: "Motivo" },
            { key: "status", label: "Status" },
            { key: "prazo_resposta", label: "Prazo de resposta" },
            { key: "turno_resposta", label: "Turno" }
          ]}
          rows={filtrados.map((r) => ({
            produto: r.produto,
            sku: r.sku ?? "-",
            numero_pedido: r.numero_pedido,
            tipo: <Badge tone={toneTipo(r.tipo)}>{r.tipo}</Badge>,
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
            )
          }))}
        />
      </Section>
    </div>
  );
}
