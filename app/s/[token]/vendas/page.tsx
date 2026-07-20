import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
import VendasVisitasDrilldown from "@/components/VendasVisitasDrilldown";
import CurvaAbcTable from "@/components/CurvaAbcTable";
import CampanhasChart from "@/components/CampanhasChart";
import { formatBRL, formatNumber, formatPct } from "@/lib/format";

const SAUDE_LABELS: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  em_ruptura: { label: "Em ruptura", tone: "bad" },
  ruptura_iminente: { label: "Ruptura iminente", tone: "bad" },
  critico: { label: "Crítico", tone: "warn" },
  atencao: { label: "Atenção", tone: "warn" },
  sem_vendas: { label: "Sem vendas 60d", tone: "neutral" },
  excedente: { label: "Excedente", tone: "neutral" },
  saudavel: { label: "Saudável", tone: "good" }
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

  const v = data.vendas;
  const v_campanhas = data.campanhas;
  const urgentes = ["em_ruptura", "ruptura_iminente", "critico"]
    .flatMap((k) => (v.produtos_60d[k] || []).map((p) => ({ ...p, categoria: k })))
    .slice(0, 20);

  return (
    <DashboardChrome token={params.token} active="vendas" data={data}>
      <VendasVisitasDrilldown
        serieFaturamento={v.serie_faturamento_diario}
        serieVisitas={v.serie_visitas_diario}
        vendasPorDia={v.vendas_por_dia}
        visitasPorDia={v.visitas_por_dia}
      />

      <Section title="Saúde de estoque (Produtos 60D)" description="Classificação por giro e cobertura de estoque">
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(v.produtos_60d_resumo).map(([k, count]) => (
            <Badge key={k} tone={SAUDE_LABELS[k]?.tone ?? "neutral"}>
              {SAUDE_LABELS[k]?.label ?? k}: {count}
            </Badge>
          ))}
        </div>
        <SimpleTable
          emptyLabel="Nenhum produto em situação crítica de estoque."
          columns={[
            { key: "titulo", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "categoria", label: "Situação" },
            { key: "estoque", label: "Estoque", align: "right" },
            { key: "cobertura", label: "Cobertura (dias)", align: "right" }
          ]}
          rows={urgentes.map((p) => ({
            titulo: p.titulo,
            sku: p.sku,
            categoria: <Badge tone={SAUDE_LABELS[p.categoria]?.tone ?? "neutral"}>{SAUDE_LABELS[p.categoria]?.label}</Badge>,
            estoque: formatNumber(p.estoque_disponivel),
            cobertura: p.cobertura_dias >= 999 ? "-" : formatNumber(p.cobertura_dias)
          }))}
        />
      </Section>

      <Section title="Curva ABC" description="Participação no faturamento dos últimos 60 dias">
        <CurvaAbcTable items={v.curva_abc} />
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Risco de preço" description="Itens acima do menor preço encontrado na concorrência">
          <SimpleTable
            emptyLabel="Nenhum risco de preço identificado."
            columns={[
              { key: "titulo", label: "Produto" },
              { key: "dif", label: "Diferença", align: "right" },
              { key: "concorrente", label: "Menor concorrente", align: "right" }
            ]}
            rows={v.preco_risco.map((p) => ({
              titulo: p.titulo,
              dif: <span className="font-medium text-bad">+{formatPct(p.diferenca_pct)}</span>,
              concorrente: formatBRL(p.menor_preco_concorrente)
            }))}
          />
        </Section>

        <Section title="Oportunidade de preço" description="Itens abaixo do menor preço encontrado na concorrência">
          <SimpleTable
            emptyLabel="Nenhuma oportunidade identificada."
            columns={[
              { key: "titulo", label: "Produto" },
              { key: "dif", label: "Diferença", align: "right" },
              { key: "concorrente", label: "Menor concorrente", align: "right" }
            ]}
            rows={v.preco_oportunidade.map((p) => ({
              titulo: p.titulo,
              dif: <span className="font-medium text-good">{formatPct(p.diferenca_pct)}</span>,
              concorrente: formatBRL(p.menor_preco_concorrente)
            }))}
          />
        </Section>
      </div>

      <Section
        title="Campanhas"
        description={`${v_campanhas.disponiveis} campanhas disponíveis · participando em ${v_campanhas.participando}`}
      >
        <CampanhasChart data={v_campanhas.por_campanha} />
      </Section>
    </DashboardChrome>
  );
}
