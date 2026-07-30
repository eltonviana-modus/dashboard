"use client";

import { useMemo, useState } from "react";
import Section from "@/components/Section";
import SimpleTable from "@/components/SimpleTable";
import MotivoBarChart from "@/components/MotivoBarChart";
import Badge from "@/components/Badge";
import { formatDateBR } from "@/lib/format";
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
 * uma categoria irmã) têm gráficos separados — cada um "por produto"/"por motivo" mostra só o
 * que está em andamento (ver fix 2026-07-30 no "Calcular Dashboard": reclamacoesPeriodo/
 * devolucoesPeriodo agora filtram por abertas, não por todas as do período) — mas a listagem
 * embaixo é UMA SÓ, coberta pela coluna "Tipo", pra não duplicar o mesmo pedido (uma venda pode
 * transicionar de reclamação pra devolução sem gerar uma segunda linha). Pedido do Elton em
 * 2026-07-30.
 */
export default function ReclamacoesDevolucoesInterativo({
  reclamacaoPorProduto,
  reclamacaoPorMotivo,
  devolucaoPorProduto,
  devolucaoPorMotivo,
  listaAbertas
}: {
  reclamacaoPorProduto: ReclamacaoProduto[];
  reclamacaoPorMotivo: Record<string, number>;
  devolucaoPorProduto: ReclamacaoProduto[];
  devolucaoPorMotivo: Record<string, number>;
  listaAbertas: ReclamacaoListaItem[];
}) {
  const [produtoSel, setProdutoSel] = useState<string | null>(null);
  const [motivoSel, setMotivoSel] = useState<string | null>(null);

  // Top 10 (em vez de 15) pra manter a pizza legível — muitas fatias finas viram ruído visual.
  const topReclamacaoProduto = useMemo(() => {
    const ordenado = [...reclamacaoPorProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [reclamacaoPorProduto]);

  const topDevolucaoProduto = useMemo(() => {
    const ordenado = [...devolucaoPorProduto].sort((a, b) => b.total - a.total).slice(0, 10);
    return Object.fromEntries(ordenado.map((p) => [p.produto, p.total]));
  }, [devolucaoPorProduto]);

  // A listagem sempre mostra TODAS as ocorrências em aberto, independente do período selecionado
  // na página — só os gráficos acima respeitam o filtro de data.
  const filtrados = listaAbertas.filter((r) => {
    if (produtoSel && r.produto !== produtoSel) return false;
    if (motivoSel && r.motivo !== motivoSel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Reclamação por produto" description="Em andamento, no período · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={topReclamacaoProduto}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel="Nenhuma reclamação em andamento no período."
          />
        </Section>

        <Section title="Reclamação por motivo" description="Em andamento, no período · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={reclamacaoPorMotivo}
            selected={motivoSel}
            onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))}
            emptyLabel="Nenhuma reclamação em andamento no período."
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Devolução por produto" description="Em andamento, no período · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={topDevolucaoProduto}
            selected={produtoSel}
            onSelect={(produto) => setProdutoSel((cur) => (cur === produto ? null : produto))}
            emptyLabel="Nenhuma devolução em andamento no período."
          />
        </Section>

        <Section title="Devolução por motivo" description="Em andamento, no período · clique numa fatia para filtrar a listagem abaixo">
          <MotivoBarChart
            data={devolucaoPorMotivo}
            selected={motivoSel}
            onSelect={(m) => setMotivoSel((cur) => (cur === m ? null : m))}
            emptyLabel="Nenhuma devolução em andamento no período."
          />
        </Section>
      </div>

      <Section
        title="Listagem de reclamações e devoluções em aberto"
        description={`${filtrados.length} em aberto · independente do período selecionado acima${
          produtoSel ? ` · produto: ${produtoSel}` : ""
        }${motivoSel ? ` · motivo: ${motivoSel}` : ""}`}
      >
        <SimpleTable
          key={`${produtoSel ?? "all"}::${motivoSel ?? "all"}`}
          emptyLabel="Nenhuma reclamação ou devolução em aberto encontrada com esse filtro."
          exportFilename="reclamacoes_devolucoes_em_aberto"
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
