import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
import { formatBRL, formatDateBR } from "@/lib/format";

const PROBLEMA_LABELS: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  muita_visita_sem_venda: { label: "Muita visita sem venda", tone: "warn" },
  sem_visita: { label: "Sem visita", tone: "neutral" },
  queda_trafego: { label: "Queda de tráfego", tone: "warn" },
  ruptura_com_venda: { label: "Ruptura com venda perdida", tone: "bad" }
};

const PRIORIDADE_TONE: Record<string, "good" | "warn" | "bad"> = {
  Alta: "bad",
  Média: "warn",
  Baixa: "good"
};

export default async function OperacaoPage({ params }: { params: { token: string } }) {
  const data = await getDashboardData(params.token);
  if (!data) notFound();

  const o = data.operacao;

  return (
    <DashboardChrome token={params.token} active="operacao" data={data}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Status dos anúncios" description={`${o.total_anuncios} anúncios monitorados`}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(o.anuncios_por_status).map(([status, count]) => (
              <Badge
                key={status}
                tone={status === "Ativo" ? "good" : status.toLowerCase().includes("pausad") ? "warn" : "neutral"}
              >
                {status}: {count}
              </Badge>
            ))}
          </div>
        </Section>

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
      </div>

      <Section title="Fila de ações da IA" description="Alertas pendentes, por prioridade">
        {(["Alta", "Média", "Baixa"] as const).map((prioridade) => {
          const items = o.acoes_por_prioridade[prioridade] || [];
          if (!items.length) return null;
          return (
            <div key={prioridade} className="mb-4 last:mb-0">
              <div className="mb-2 flex items-center gap-2">
                <Badge tone={PRIORIDADE_TONE[prioridade]}>{prioridade}</Badge>
                <span className="text-xs text-ink-500">{items.length} ação(ões)</span>
              </div>
              <SimpleTable
                columns={[
                  { key: "produto", label: "Produto" },
                  { key: "problema", label: "Problema" },
                  { key: "acao", label: "Ação recomendada" },
                  { key: "resp", label: "Responsável" }
                ]}
                rows={items.map((a) => ({
                  produto: a.produto || a.sku,
                  problema: a.problema,
                  acao: a.acao_recomendada,
                  resp: a.responsavel
                }))}
              />
            </div>
          );
        })}
        {!Object.values(o.acoes_por_prioridade).some((arr) => arr.length) && (
          <p className="py-6 text-center text-sm text-ink-500">Nenhuma ação pendente no momento.</p>
        )}
      </Section>

      <Section title="Produtos problemáticos" description="Padrões de tráfego e conversão que pedem atenção">
        <div className="space-y-5">
          {Object.entries(o.produtos_problematicos).map(([key, items]) =>
            items.length ? (
              <div key={key}>
                <div className="mb-2">
                  <Badge tone={PROBLEMA_LABELS[key]?.tone ?? "neutral"}>{PROBLEMA_LABELS[key]?.label ?? key}</Badge>
                  <span className="ml-2 text-xs text-ink-500">{items.length} produto(s)</span>
                </div>
                <SimpleTable
                  columns={[
                    { key: "titulo", label: "Produto" },
                    { key: "sku", label: "SKU" }
                  ]}
                  rows={items.map((i) => ({ titulo: i.titulo, sku: i.sku ?? i.item_id }))}
                />
              </div>
            ) : null
          )}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Reclamações por produto" description={`${o.total_reclamacoes} reclamações · ${o.total_devolucoes} devoluções`}>
          <SimpleTable
            emptyLabel="Nenhuma reclamação no período."
            columns={[
              { key: "produto", label: "Produto" },
              { key: "total", label: "Total", align: "right" },
              { key: "motivos", label: "Principais motivos" }
            ]}
            rows={o.reclamacoes_por_produto.map((r) => ({
              produto: r.produto,
              total: r.total,
              motivos: Object.entries(r.motivos)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([m, c]) => `${m} (${c})`)
                .join(", ")
            }))}
          />
        </Section>

        <Section title="Reclamações por motivo" description="Consolidado do período">
          <SimpleTable
            emptyLabel="Nenhuma reclamação no período."
            columns={[
              { key: "motivo", label: "Motivo" },
              { key: "total", label: "Total", align: "right" }
            ]}
            rows={Object.entries(o.reclamacoes_por_motivo)
              .sort((a, b) => b[1] - a[1])
              .map(([motivo, total]) => ({ motivo, total }))}
          />
        </Section>
      </div>

      <Section title="Detalhe de Ads" description="Campanhas com custo no período">
        <SimpleTable
          emptyLabel="Nenhuma campanha ativa com custo no período."
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
