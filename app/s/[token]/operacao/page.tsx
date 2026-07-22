import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
import AnunciosListing from "@/components/AnunciosListing";
import SaudeEstoqueListing from "@/components/SaudeEstoqueListing";
import AcoesIaListing from "@/components/AcoesIaListing";
import ReclamacoesInterativo from "@/components/ReclamacoesInterativo";
import StatusPieChart from "@/components/StatusPieChart";
import { formatBRL } from "@/lib/format";

// Status reais que a coleta de anúncios (WF 03a) gera hoje. Não existe status
// "Mediação" — mediação é uma métrica separada, ligada a reclamações/disputas de
// pedido, não ao status do anúncio.
const STATUS_ANUNCIO_CORES: Record<string, string> = {
  Ativo: "#16a34a",
  "Ativo - Moderado": "#22c55e",
  "Pausado - Manual": "#eab308",
  "Pausado - Estoque": "#f97316",
  "Pausado - Infracao": "#dc2626",
  "Inativo - Revisar": "#7c3aed",
  "Sem status": "#94a3b8"
};

export default async function OperacaoPage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { range?: string; start?: string; end?: string };
}) {
  const data = await getDashboardData(params.token, searchParams);
  if (!data) notFound();

  const o = data.operacao;
  const v = data.vendas;

  const acoesFlat = Object.entries(o.acoes_por_prioridade).flatMap(([prioridade, items]) =>
    items.map((a) => ({ ...a, prioridade }))
  );

  return (
    <DashboardChrome token={params.token} active="operacao" data={data}>
      <Section title="Performance de Ads" description="Classificação por campanha">
        <div className="flex flex-wrap gap-2">
          {Object.entries(o.ads_resumo).map(([classe, count]) => (
            <Badge
              key={classe}
              tone={classe === "Excelente" || classe === "Bom" ? "good" : classe === "Regular" ? "warn" : classe === "Ruim" ? "bad" : "neutral"}
            >
              {classe}: {count}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Status dos anúncios" description={`${o.total_anuncios} anúncios monitorados`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
          <StatusPieChart data={o.anuncios_por_status} colorMap={STATUS_ANUNCIO_CORES} height={320} />
          <AnunciosListing items={o.anuncios_lista} maxHeight="20rem" />
        </div>
      </Section>

      <Section title="Saúde de estoque (Produtos 60D)" description="Classificação por giro e cobertura de estoque">
        <SaudeEstoqueListing items={v.produtos_60d_lista} />
      </Section>

      <Section title="Fila de ações da IA" description="Alertas pendentes, por prioridade">
        <AcoesIaListing items={acoesFlat} />
      </Section>

      <ReclamacoesInterativo porProduto={o.reclamacoes_por_produto} porMotivo={o.reclamacoes_por_motivo} />

      <Section title="Detalhe de Ads" description="Campanhas com custo no período">
        <SimpleTable
          emptyLabel="Nenhuma campanha ativa com custo no período."
          exportFilename="detalhe_de_ads"
          exportColumns={[
            { key: "titulo", label: "Produto" },
            { key: "custo", label: "Custo Ads" },
            { key: "roas", label: "ROAS" },
            { key: "acos", label: "ACOS" },
            { key: "classe", label: "Classificação" }
          ]}
          exportRows={o.ads_performance.map((a) => ({
            titulo: a.titulo,
            custo: a.custo_ads,
            roas: a.roas,
            acos: a.acos,
            classe: a.classificacao || ""
          }))}
          columns={[
            { key: "titulo", label: "Produto" },
            { key: "custo", label: "Custo Ads", align: "right" },
            { key: "roas", label: "ROAS", align: "right" },
            { key: "acos", label: "ACOS", align: "right" },
            { key: "classe", label: "Classificação" }
          ]}
          rows={o.ads_performance.map((a) => ({
            titulo: a.titulo,
            custo: formatBRL(a.custo_ads),
            roas: a.roas.toFixed(2),
            acos: `${a.acos.toFixed(1)}%`,
            classe: (
              <Badge tone={a.classificacao === "Excelente" || a.classificacao === "Bom" ? "good" : a.classificacao === "Regular" ? "warn" : "bad"}>
                {a.classificacao || "-"}
              </Badge>
            )
          }))}
        />
      </Section>
    </DashboardChrome>
  );
}
