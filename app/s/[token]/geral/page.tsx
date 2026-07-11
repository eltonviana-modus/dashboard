import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import KpiCard from "@/components/KpiCard";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import RevenueChart from "@/components/RevenueChart";
import { formatBRL, formatNumber, formatPct, formatDateBR } from "@/lib/format";

export default async function GeralPage({ params }: { params: { token: string } }) {
  const data = await getDashboardData(params.token);
  if (!data) notFound();

  const g = data.geral;
  const saude = g.saude_conta;

  const reputacaoTone = saude.nivel_reputacao?.toLowerCase().includes("verde")
    ? "good"
    : saude.nivel_reputacao?.toLowerCase().includes("amarel")
    ? "warn"
    : saude.nivel_reputacao
    ? "bad"
    : "neutral";

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
        <div className="lg:col-span-2">
          <Section title="Faturamento diário" description={`Últimos ${data.periodo.dias} dias`}>
            <RevenueChart data={data.vendas.serie_faturamento_diario} />
          </Section>
        </div>

        <Section title="Saúde da conta">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Reputação</span>
              <Badge tone={reputacaoTone as any}>{saude.nivel_reputacao || "Sem dado"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Medalha</span>
              <span className="text-xs font-medium text-ink-900">{saude.medalha || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Taxa de cancelamento</span>
              <span className="text-xs font-medium text-ink-900">{formatPct(saude.tx_cancelamento)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Taxa de atraso</span>
              <span className="text-xs font-medium text-ink-900">{formatPct(saude.tx_atraso)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Reclamações abertas</span>
              <span className="text-xs font-medium text-ink-900">{saude.reclamacoes_abertas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">Mediações abertas</span>
              <span className="text-xs font-medium text-ink-900">{saude.mediacoes_abertas}</span>
            </div>
          </div>
        </Section>
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
          </div>
        </Section>
      </div>
    </DashboardChrome>
  );
}
