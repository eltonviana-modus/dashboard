import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import KpiCard from "@/components/KpiCard";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import StatusPieChart from "@/components/StatusPieChart";
import ReputacaoTermometro from "@/components/ReputacaoTermometro";
import { Award, XCircle, Clock3, MessageSquareWarning, Undo2, ShieldAlert } from "lucide-react";
import { formatBRL, formatNumber, formatPct, formatDateBR } from "@/lib/format";

const ESTOQUE_LABELS: Record<string, string> = {
  em_ruptura: "Em ruptura",
  ruptura_iminente: "Ruptura iminente",
  critico: "Crítico",
  atencao: "Atenção",
  saudavel: "Saudável",
  excedente: "Excedente",
  sem_vendas: "Parado (sem venda)"
};

const ESTOQUE_CORES: Record<string, string> = {
  em_ruptura: "#dc2626",
  ruptura_iminente: "#f97316",
  critico: "#f59e0b",
  atencao: "#eab308",
  saudavel: "#22c55e",
  excedente: "#0891b2",
  sem_vendas: "#64748b"
};

export default async function GeralPage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { range?: string; start?: string; end?: string };
}) {
  const data = await getDashboardData(params.token, searchParams);
  if (!data) notFound();

  const g = data.geral;
  const saude = g.saude_conta;

  const estoqueChartData = Object.fromEntries(
    Object.entries(data.vendas.produtos_60d_resumo).map(([k, v]) => [ESTOQUE_LABELS[k] ?? k, v])
  );
  const estoqueColorMap = Object.fromEntries(
    Object.entries(data.vendas.produtos_60d_resumo).map(([k]) => [ESTOQUE_LABELS[k] ?? k, ESTOQUE_CORES[k] ?? "#64748b"])
  );

  return (
    <DashboardChrome token={params.token} active="geral" data={data}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Faturamento" value={formatBRL(g.faturamento)} deltaPct={g.faturamento_delta_pct} />
        <KpiCard label="Pedidos" value={formatNumber(g.pedidos)} deltaPct={g.pedidos_delta_pct} />
        <KpiCard label="Ticket médio" value={formatBRL(g.ticket_medio)} deltaPct={g.ticket_medio_delta_pct} />
        <KpiCard label="Visitas" value={formatNumber(g.visitas)} deltaPct={g.visitas_delta_pct} />
        <KpiCard label="Conversão" value={formatPct(g.taxa_conversao)} deltaPct={g.taxa_conversao_delta_pct} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Saúde da conta">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <ShieldAlert size={15} className="text-ink-500" />
                <span className="text-xs text-ink-500">Reputação</span>
              </div>
              <ReputacaoTermometro nivelReputacao={saude.nivel_reputacao} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-ink-500">
                <Award size={15} className="text-ink-500" /> Medalha
              </span>
              <span className="text-xs font-medium text-ink-900">{saude.medalha || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-ink-500">
                <XCircle size={15} className="text-ink-500" /> Taxa de cancelamento
              </span>
              <span className="text-xs font-medium text-ink-900">{formatPct(saude.tx_cancelamento)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-ink-500">
                <Clock3 size={15} className="text-ink-500" /> Taxa de atraso
              </span>
              <span className="text-xs font-medium text-ink-900">{formatPct(saude.tx_atraso)}</span>
            </div>
          </div>
        </Section>

        <Section title="Status dos anúncios" description={`${data.operacao.total_anuncios} anúncios monitorados`}>
          <StatusPieChart data={data.operacao.anuncios_por_status} />
        </Section>

        <Section title="Saúde do estoque" description="Classificação por giro e cobertura (60d)">
          <StatusPieChart data={estoqueChartData} colorMap={estoqueColorMap} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-ink-300/40 bg-surface-1 p-4">
          <MessageSquareWarning size={20} className="text-bad" />
          <div>
            <p className="text-xs text-ink-500">Reclamações em aberto</p>
            <p className="text-lg font-semibold text-ink-900">{saude.reclamacoes_abertas}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-ink-300/40 bg-surface-1 p-4">
          <Undo2 size={20} className="text-warn" />
          <div>
            <p className="text-xs text-ink-500">Devoluções no período</p>
            <p className="text-lg font-semibold text-ink-900">{data.operacao.total_devolucoes}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-ink-300/40 bg-surface-1 p-4">
          <ShieldAlert size={20} className="text-ink-500" />
          <div>
            <p className="text-xs text-ink-500">Mediações abertas</p>
            <p className="text-lg font-semibold text-ink-900">{saude.mediacoes_abertas}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section
            title="Relatório do Gerente Geral (IA)"
            description={data.geral.relatorio_data ? `Gerado em ${formatDateBR(data.geral.relatorio_data)}` : undefined}
          >
            {g.relatorio_gerente_geral ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-700">
                {g.relatorio_gerente_geral}
              </pre>
            ) : (
              <p className="text-sm text-ink-500">
                Nenhum relatório gerado ainda para este período. O relatório roda semanalmente.
              </p>
            )}
          </Section>
        </div>

        <Section title="Automação nesta conta" description="Ações do motor de IA">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Anúncios ativos</span>
              <span className="text-sm font-semibold text-ink-900">{g.resumo_automacao.anuncios_ativos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Ações pendentes</span>
              <span className="text-sm font-semibold text-ink-900">{g.resumo_automacao.acoes_pendentes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Alertas de alta prioridade</span>
              <Badge tone={g.resumo_automacao.alertas_alta_prioridade > 0 ? "bad" : "good"}>
                {g.resumo_automacao.alertas_alta_prioridade}
              </Badge>
            </div>
            {g.resumo_automacao.acoes_identificadas_7d !== undefined && (
              <>
                <div className="my-2 border-t border-ink-300/30" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-500">Problemas identificados (7d)</span>
                  <span className="text-sm font-semibold text-ink-900">{g.resumo_automacao.acoes_identificadas_7d}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-500">Fechados pelo seller (7d)</span>
                  <span className="text-sm font-semibold text-ink-900">{g.resumo_automacao.acoes_resolvidas_7d}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-500">Taxa de resolução (7d)</span>
                  <span className="text-sm font-semibold text-ink-900">
                    {g.resumo_automacao.taxa_resolucao_7d_pct != null ? formatPct(g.resumo_automacao.taxa_resolucao_7d_pct) : "-"}
                  </span>
                </div>
              </>
            )}
            {g.resumo_automacao.perguntas_respondidas_ia !== undefined && (
              <>
                <div className="my-2 border-t border-ink-300/30" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-500">Perguntas respondidas pela IA</span>
                  <span className="text-sm font-semibold text-ink-900">{g.resumo_automacao.perguntas_respondidas_ia}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-500">Total respondidas (IA + loja)</span>
                  <span className="text-sm font-semibold text-ink-900">{g.resumo_automacao.perguntas_respondidas_total}</span>
                </div>
              </>
            )}
          </div>
        </Section>
      </div>
    </DashboardChrome>
  );
}
