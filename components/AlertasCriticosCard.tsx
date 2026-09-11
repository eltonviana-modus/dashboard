import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
import TruncateTooltip from "@/components/TruncateTooltip";
import { Truck, PackageX, AlertOctagon, Gauge, PauseCircle, ShieldCheck } from "lucide-react";
import { formatBRL, formatNumber, formatPct, formatPrazoBR } from "@/lib/format";
import type { AlertasCriticos } from "@/lib/api";

/**
 * Tela de aviso crítico (Central de Alertas) — aba Geral.
 * Reúne os 5 alertas que precisam de ação imediata do seller: pedidos com risco de atraso
 * na postagem, produtos curva A/B perto de ruptura, reclamações com prazo de resposta em
 * até 24h (D+1), reputação perto de comprometer alguma faixa (>=80% do limite) e anúncios
 * pausados que ainda têm estoque disponível (oportunidade de reativar).
 * Dados vêm de alertas_criticos no JSON do dashboard (WF11 grava as tabelas Postgres,
 * "Calcular Dashboard" monta o objeto). Pedido do Elton em 2026-09-07/08.
 */
export default function AlertasCriticosCard({ alertas }: { alertas: AlertasCriticos }) {
  const total = alertas.total_alertas;

  return (
    <section
      className={`rounded-lg border p-5 ${
        total > 0 ? "border-bad/40 bg-bad-bg/40" : "border-ink-300/40 bg-surface-1"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            {total > 0 ? <AlertOctagon size={16} className="text-bad" /> : <ShieldCheck size={16} className="text-good" />}
            Central de alertas críticos
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">Itens que precisam de ação agora, atualizados diariamente</p>
        </div>
        <Badge tone={total > 0 ? "bad" : "good"}>{total > 0 ? `${total} alerta${total > 1 ? "s" : ""}` : "Tudo em dia"}</Badge>
      </div>

      {total === 0 ? (
        <p className="py-4 text-center text-sm text-ink-500">Nenhum alerta crítico agora. 🎉</p>
      ) : (
        /* Scroll do card todo (max-h + overflow) -- antes so as tabelas internas (14rem) tinham
         * limite, e o card em si crescia sem teto conforme mais blocos/itens apareciam. Agora tem
         * os 2 niveis: scroll do card (aqui) + scroll de cada tabela interna (mantido). Pedido do
         * Elton em 2026-09-08. */
        <div className="max-h-[32rem] space-y-5 overflow-y-auto pr-1">
          {alertas.pedidos_atrasados_postagem.length > 0 && (
            <BlocoAlerta
              icon={<Truck size={15} className="text-bad" />}
              titulo="Pedidos com risco de atraso na postagem"
              qtd={alertas.pedidos_atrasados_postagem.length}
              novos={alertas.pedidos_atrasados_postagem.filter((p) => p.novo).length}
            >
              <SimpleTable
                maxHeight="14rem"
                exportFilename="alertas_pedidos_atraso_postagem"
                exportColumns={[
                  { key: "order_id", label: "Pedido" },
                  { key: "item_titulo", label: "Item" },
                  { key: "status_envio", label: "Status envio" },
                  { key: "data_pedido", label: "Data do pedido" },
                  { key: "dias_atraso", label: "Dias de atraso" }
                ]}
                exportRows={alertas.pedidos_atrasados_postagem.map((p) => ({
                  order_id: p.order_id,
                  item_titulo: p.item_titulo,
                  status_envio: p.status_envio || "-",
                  data_pedido: formatPrazoBR(p.data_pedido),
                  dias_atraso: p.dias_atraso != null ? formatNumber(p.dias_atraso) : "-"
                }))}
                columns={[
                  { key: "order_id", label: "Pedido" },
                  { key: "item_titulo", label: "Item" },
                  { key: "status_envio", label: "Status envio" },
                  { key: "data_pedido", label: "Data do pedido" },
                  { key: "dias_atraso", label: "Dias de atraso", align: "right" }
                ]}
                rows={alertas.pedidos_atrasados_postagem.map((p) => ({
                  order_id: p.order_id,
                  item_titulo: (
                    <ComDot novo={p.novo}>
                      <TruncateTooltip text={p.item_titulo} maxWidth="16rem" maxLines={2} />
                    </ComDot>
                  ),
                  status_envio: p.status_envio || "-",
                  data_pedido: formatPrazoBR(p.data_pedido),
                  dias_atraso: (
                    <span className={p.dias_atraso != null && p.dias_atraso > 3 ? "font-semibold text-bad" : ""}>
                      {p.dias_atraso != null ? formatNumber(p.dias_atraso) : "-"}
                    </span>
                  )
                }))}
              />
            </BlocoAlerta>
          )}

          {alertas.estoque_curva_ab_critico.length > 0 && (
            <BlocoAlerta
              icon={<PackageX size={15} className="text-bad" />}
              titulo="Estoque crítico em produtos curva A/B (cobertura ≤ 15 dias)"
              qtd={alertas.estoque_curva_ab_critico.length}
              novos={alertas.estoque_curva_ab_critico.filter((p) => p.novo).length}
            >
              <SimpleTable
                maxHeight="14rem"
                exportFilename="alertas_estoque_critico_curva_ab"
                exportColumns={[
                  { key: "titulo", label: "Produto" },
                  { key: "sku", label: "SKU" },
                  { key: "classe", label: "Classe" },
                  { key: "cobertura_dias", label: "Cobertura (dias)" },
                  { key: "estoque_disponivel", label: "Estoque disp." },
                  { key: "vendas_60d", label: "Vendas 60d" },
                  { key: "faturamento_60d", label: "Faturamento 60d" }
                ]}
                exportRows={alertas.estoque_curva_ab_critico.map((p) => ({
                  titulo: p.titulo,
                  sku: p.sku ?? "-",
                  classe: p.classe,
                  cobertura_dias: formatNumber(p.cobertura_dias),
                  estoque_disponivel: formatNumber(p.estoque_disponivel),
                  vendas_60d: formatNumber(p.vendas_60d),
                  faturamento_60d: formatBRL(p.faturamento_60d)
                }))}
                columns={[
                  { key: "titulo", label: "Produto" },
                  { key: "sku", label: "SKU" },
                  { key: "classe", label: "Classe" },
                  { key: "cobertura_dias", label: "Cobertura (dias)", align: "right" },
                  { key: "estoque_disponivel", label: "Estoque disp.", align: "right" },
                  { key: "vendas_60d", label: "Vendas 60d", align: "right" },
                  { key: "faturamento_60d", label: "Faturamento 60d", align: "right" }
                ]}
                rows={alertas.estoque_curva_ab_critico.map((p) => ({
                  titulo: (
                    <ComDot novo={p.novo}>
                      <TruncateTooltip text={p.titulo} maxWidth="16rem" maxLines={2} />
                    </ComDot>
                  ),
                  sku: p.sku ?? "-",
                  classe: <Badge tone={p.classe === "A" ? "bad" : "warn"}>{p.classe}</Badge>,
                  cobertura_dias: formatNumber(p.cobertura_dias),
                  estoque_disponivel: formatNumber(p.estoque_disponivel),
                  vendas_60d: formatNumber(p.vendas_60d),
                  faturamento_60d: formatBRL(p.faturamento_60d)
                }))}
              />
            </BlocoAlerta>
          )}

          {alertas.reclamacoes_prazo_d1.length > 0 && (
            <BlocoAlerta
              icon={<AlertOctagon size={15} className="text-bad" />}
              titulo="Reclamações com prazo de resposta em até 24h"
              qtd={alertas.reclamacoes_prazo_d1.length}
              novos={alertas.reclamacoes_prazo_d1.filter((r) => r.novo).length}
            >
              <SimpleTable
                maxHeight="14rem"
                exportFilename="alertas_reclamacoes_prazo_d1"
                exportColumns={[
                  { key: "order_id", label: "Pedido" },
                  { key: "tipo", label: "Tipo" },
                  { key: "status", label: "Status" },
                  { key: "action_responsible", label: "Responsável pela ação" },
                  { key: "due_date", label: "Prazo" },
                  { key: "horas_restantes", label: "Horas restantes" }
                ]}
                exportRows={alertas.reclamacoes_prazo_d1.map((r) => ({
                  order_id: r.order_id || "-",
                  tipo: r.tipo || "-",
                  status: r.status || "-",
                  action_responsible: r.action_responsible || "-",
                  due_date: formatPrazoBR(r.due_date),
                  horas_restantes: `${formatNumber(r.horas_restantes)}h`
                }))}
                columns={[
                  { key: "order_id", label: "Pedido" },
                  { key: "tipo", label: "Tipo" },
                  { key: "status", label: "Status" },
                  { key: "action_responsible", label: "Responsável pela ação" },
                  { key: "due_date", label: "Prazo" },
                  { key: "horas_restantes", label: "Horas restantes", align: "right" }
                ]}
                rows={alertas.reclamacoes_prazo_d1.map((r) => ({
                  order_id: <ComDot novo={r.novo}>{r.order_id || "-"}</ComDot>,
                  tipo: r.tipo || "-",
                  status: r.status || "-",
                  action_responsible: r.action_responsible || "-",
                  due_date: formatPrazoBR(r.due_date),
                  horas_restantes: (
                    <span className={r.horas_restantes <= 6 ? "font-semibold text-bad" : ""}>
                      {formatNumber(r.horas_restantes)}h
                    </span>
                  )
                }))}
              />
            </BlocoAlerta>
          )}

          {alertas.sla_comprometido?.alerta && (
            <BlocoAlerta
              icon={<Gauge size={15} className="text-bad" />}
              titulo="Reputação perto de comprometer alguma faixa (≥80% do limite)"
              novos={alertas.sla_comprometido.novo ? 1 : 0}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricaSla
                  label="Reclamações"
                  pct={alertas.sla_comprometido.claims_pct_comprometido}
                  rate={alertas.sla_comprometido.claims_rate}
                  limite={alertas.sla_comprometido.claims_limite}
                />
                <MetricaSla
                  label="Cancelamentos"
                  pct={alertas.sla_comprometido.cancelamentos_pct_comprometido}
                  rate={alertas.sla_comprometido.cancelamentos_rate}
                  limite={alertas.sla_comprometido.cancelamentos_limite}
                />
                <MetricaSla
                  label="Atraso no manuseio"
                  pct={alertas.sla_comprometido.atraso_handling_pct_comprometido}
                  rate={alertas.sla_comprometido.atraso_handling_rate}
                  limite={alertas.sla_comprometido.atraso_handling_limite}
                />
              </div>
            </BlocoAlerta>
          )}

          {alertas.anuncios_pausados_com_estoque.length > 0 && (
            <BlocoAlerta
              icon={<PauseCircle size={15} className="text-warn" />}
              titulo="Anúncios pausados com estoque disponível (oportunidade de reativar)"
              qtd={alertas.anuncios_pausados_com_estoque.length}
              novos={alertas.anuncios_pausados_com_estoque.filter((a) => a.novo).length}
            >
              <SimpleTable
                maxHeight="14rem"
                exportFilename="alertas_anuncios_pausados_com_estoque"
                exportColumns={[
                  { key: "titulo", label: "Produto" },
                  { key: "sku", label: "SKU" },
                  { key: "classe", label: "Classe" },
                  { key: "estoque", label: "Estoque" },
                  { key: "status", label: "Status" }
                ]}
                exportRows={alertas.anuncios_pausados_com_estoque.map((a) => ({
                  titulo: a.titulo,
                  sku: a.sku ?? "-",
                  classe: a.classe,
                  estoque: formatNumber(a.estoque),
                  status: a.status || "-"
                }))}
                columns={[
                  { key: "titulo", label: "Produto" },
                  { key: "sku", label: "SKU" },
                  { key: "classe", label: "Classe" },
                  { key: "estoque", label: "Estoque", align: "right" },
                  { key: "status", label: "Status" }
                ]}
                rows={alertas.anuncios_pausados_com_estoque.map((a) => ({
                  titulo: (
                    <ComDot novo={a.novo}>
                      <TruncateTooltip text={a.titulo} maxWidth="16rem" maxLines={2} />
                    </ComDot>
                  ),
                  sku: a.sku ?? "-",
                  classe: <Badge tone={a.classe === "A" ? "bad" : "warn"}>{a.classe}</Badge>,
                  estoque: formatNumber(a.estoque),
                  status: a.status || "-"
                }))}
              />
            </BlocoAlerta>
          )}
        </div>
      )}
    </section>
  );
}

function BlocoAlerta({
  icon,
  titulo,
  qtd,
  novos,
  children
}: {
  icon: React.ReactNode;
  titulo: string;
  qtd?: number;
  /** Quantos itens deste bloco são "novos hoje" (novo=true) -- exibe ao lado do total, com a
   * mesma bolinha usada nas linhas da tabela. Pedido do Elton em 2026-09-11. */
  novos?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-ink-300/30 bg-surface-1 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-ink-900">
          {icon}
          {titulo}
        </span>
        <span className="flex items-center gap-2">
          {!!novos && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <NovoDot />
              {novos} novo{novos > 1 ? "s" : ""} hoje
            </span>
          )}
          {qtd !== undefined && <Badge tone="bad">{qtd}</Badge>}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * Bolinha "novo" (estilo WhatsApp): destaca alertas cujo primeiro registro no banco foi hoje.
 * O backend ("Calcular Dashboard" no workflow [DASH]) só manda novo=true no dia em que o
 * alerta foi visto pela primeira vez -- pedidos_atraso/reclamacoes_criticas usam a própria
 * atualizado_em (que nunca é tocada em upserts seguintes, então funciona como "primeiro visto"),
 * estoque crítico e anúncio pausado usam a tabela alertas_primeiro_visto (WF11), e sla_comprometido
 * compara a leitura atual de reputacao_metrics com a anterior. Some sozinha a partir do dia
 * seguinte, sem precisar marcar como lido. Pedido do Elton em 2026-09-11.
 */
function NovoDot() {
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0" title="Novo hoje" aria-label="Novo hoje">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

/** Envolve o conteúdo da 1ª coluna de uma linha da tabela com a bolinha de "novo" quando
 * novo=true. Ver NovoDot. */
function ComDot({ novo, children }: { novo?: boolean; children: React.ReactNode }) {
  if (!novo) return <>{children}</>;
  return (
    <span className="flex items-center gap-1.5">
      <NovoDot />
      {children}
    </span>
  );
}

/**
 * pct = quanto da faixa atual de reputação já foi consumido (taxa/limite*100) -- NÃO é a taxa de
 * reclamação/cancelamento em si (essa é rate, ex. 0.0129 = 1,29%). Mostrar só o pct sem contexto
 * confundia com tx_reclamacao do card Saúde da conta (ex. pct=99% ao lado de uma taxa real de só
 * 1%, porque o teto da faixa é bem próximo da taxa atual). Pedido do Elton em 2026-09-08.
 */
function MetricaSla({
  label,
  pct,
  rate,
  limite
}: {
  label: string;
  pct: number | null;
  rate?: number | null;
  limite?: number | null;
}) {
  if (pct == null) return null;
  const tone = pct >= 100 ? "bad" : pct >= 80 ? "warn" : "good";
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2">
      <div>
        <span className="block text-xs text-ink-500">{label}</span>
        {rate != null && limite != null && (
          <span className="block text-[11px] text-ink-400">
            taxa {formatPct(rate * 100)} / limite {formatPct(limite * 100)}
          </span>
        )}
      </div>
      <Badge tone={tone}>{pct.toFixed(0)}% do limite</Badge>
    </div>
  );
}
