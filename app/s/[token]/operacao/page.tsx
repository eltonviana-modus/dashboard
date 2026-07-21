import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
import TaggedListing from "@/components/TaggedListing";
import ReclamacoesInterativo from "@/components/ReclamacoesInterativo";
import { formatBRL, formatNumber } from "@/lib/format";

const SAUDE_LABELS: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  em_ruptura: { label: "Em ruptura", tone: "bad" },
  ruptura_iminente: { label: "Ruptura iminente", tone: "bad" },
  critico: { label: "Crítico", tone: "warn" },
  atencao: { label: "Atenção", tone: "warn" },
  sem_vendas: { label: "Sem vendas 60d", tone: "neutral" },
  excedente: { label: "Excedente", tone: "neutral" },
  saudavel: { label: "Saudável", tone: "good" }
};

const PRIORIDADE_TONE: Record<string, "good" | "warn" | "bad"> = {
  Alta: "bad",
  Média: "warn",
  Baixa: "good"
};

function toneParaStatus(status: string): "good" | "warn" | "bad" | "neutral" {
  if (status === "Ativo") return "good";
  if (status.toLowerCase().includes("pausad")) return "warn";
  if (status.toLowerCase().includes("finaliz") || status.toLowerCase().includes("fechad")) return "bad";
  return "neutral";
}

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
        <TaggedListing
          items={o.anuncios_lista}
          categoriaKey="status"
          tagLabel={(status) => ({ label: status, tone: toneParaStatus(status) })}
          exportFilename="status_dos_anuncios"
          emptyLabel="Nenhum anúncio encontrado."
          searchKeys={["titulo", "sku"]}
          columns={[
            { key: "titulo", label: "Anúncio" },
            { key: "sku", label: "SKU" },
            { key: "status", label: "Status", render: (i) => <Badge tone={toneParaStatus(i.status)}>{i.status}</Badge> },
            { key: "estoque", label: "Estoque", align: "right" }
          ]}
        />
      </Section>

      <Section title="Saúde de estoque (Produtos 60D)" description="Classificação por giro e cobertura de estoque">
        <TaggedListing
          items={v.produtos_60d_lista}
          categoriaKey="categoria"
          tagLabel={(cat) => SAUDE_LABELS[cat] ?? { label: cat, tone: "neutral" }}
          exportFilename="saude_de_estoque"
          emptyLabel="Nenhum produto encontrado."
          searchKeys={["titulo", "sku"]}
          columns={[
            { key: "titulo", label: "Produto" },
            { key: "sku", label: "SKU" },
            {
              key: "categoria",
              label: "Situação",
              render: (i) => <Badge tone={SAUDE_LABELS[i.categoria]?.tone ?? "neutral"}>{SAUDE_LABELS[i.categoria]?.label ?? i.categoria}</Badge>
            },
            { key: "estoque_disponivel", label: "Estoque", align: "right" },
            {
              key: "cobertura_dias",
              label: "Cobertura (dias)",
              align: "right",
              value: (i) => (i.cobertura_dias >= 999 ? "" : i.cobertura_dias),
              render: (i) => (i.cobertura_dias >= 999 ? "-" : formatNumber(i.cobertura_dias))
            }
          ]}
        />
      </Section>

      <Section title="Fila de ações da IA" description="Alertas pendentes, por prioridade">
        <TaggedListing
          items={acoesFlat}
          categoriaKey="prioridade"
          tagLabel={(p) => ({ label: p, tone: PRIORIDADE_TONE[p] ?? "neutral" })}
          exportFilename="fila_de_acoes_ia"
          emptyLabel="Nenhuma ação pendente no momento."
          searchKeys={["produto", "sku"]}
          columns={[
            { key: "produto", label: "Produto", value: (a) => a.produto || a.sku, render: (a) => a.produto || a.sku },
            { key: "problema", label: "Problema" },
            { key: "acao_recomendada", label: "Ação recomendada" },
            { key: "responsavel", label: "Responsável" }
          ]}
        />
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
