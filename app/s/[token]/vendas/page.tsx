import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import KpiCard from "@/components/KpiCard";
import VendasVisitasDrilldown from "@/components/VendasVisitasDrilldown";
import CurvaAbcTable from "@/components/CurvaAbcTable";
import CampanhasChart from "@/components/CampanhasChart";
import TaggedListing from "@/components/TaggedListing";
import { formatBRL, formatNumber, formatPct } from "@/lib/format";

const ANALISE_LABELS: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  muita_visita_sem_venda: { label: "Muita visita sem venda", tone: "warn" },
  sem_visita: { label: "Sem visita", tone: "neutral" },
  queda_trafego: { label: "Queda de tráfego", tone: "warn" },
  ruptura_com_venda: { label: "Ruptura com venda perdida", tone: "bad" }
};

export default async function VendasPage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { range?: string; start?: string; end?: string };
}) {
  const data = await getDashboardData(params.token, searchParams);
  if (!data) notFound();

  const g = data.geral;
  const v = data.vendas;
  const v_campanhas = data.campanhas;

  return (
    <DashboardChrome token={params.token} active="vendas" data={data}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard compact label="Faturamento" value={formatBRL(g.faturamento)} deltaPct={g.faturamento_delta_pct} />
        <KpiCard compact label="Visitas" value={formatNumber(g.visitas)} deltaPct={g.visitas_delta_pct} />
        <KpiCard compact label="Conversão" value={formatPct(g.taxa_conversao)} deltaPct={g.taxa_conversao_delta_pct} />
        <KpiCard compact label="Pedidos" value={formatNumber(g.pedidos)} deltaPct={g.pedidos_delta_pct} />
        <KpiCard compact label="Ticket médio" value={formatBRL(g.ticket_medio)} deltaPct={g.ticket_medio_delta_pct} />
      </div>

      <VendasVisitasDrilldown
        serieFaturamento={v.serie_faturamento_diario}
        serieVisitas={v.serie_visitas_diario}
        vendasPorDia={v.vendas_por_dia}
        visitasPorDia={v.visitas_por_dia}
      />

      <Section title="Curva ABC" description="Participação no faturamento dos últimos 60 dias">
        <CurvaAbcTable items={v.curva_abc} />
      </Section>

      <Section title="Análise de visitas" description="Padrões de tráfego e conversão que pedem atenção">
        <TaggedListing
          items={v.produtos_problematicos_lista}
          categoriaKey="categoria"
          tagLabel={(cat) => ANALISE_LABELS[cat] ?? { label: cat, tone: "neutral" }}
          exportFilename="analise_de_visitas"
          emptyLabel="Nenhum produto com padrão de atenção no período."
          searchKeys={["titulo", "sku"]}
          columns={[
            { key: "titulo", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "estoque_disponivel", label: "Estoque", align: "right" },
            { key: "visitas_7d", label: "Visitas", align: "right" },
            { key: "vendas_7d", label: "Vendas", align: "right" },
            {
              key: "conversao_pct",
              label: "Conversão",
              align: "right",
              value: (i) => i.conversao_pct,
              render: (i) => formatPct(i.conversao_pct)
            }
          ]}
        />
      </Section>

      <Section
        title="Campanhas"
        description={`${v_campanhas.disponiveis} campanhas disponíveis · participando em ${v_campanhas.participando}`}
      >
        <CampanhasChart data={v_campanhas.por_campanha} />
      </Section>
    </DashboardChrome>
  );
}
