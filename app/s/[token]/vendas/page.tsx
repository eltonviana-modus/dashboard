import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
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
  const urgentes = ["em_ruptura", "ruptura_iminente", "critico"]
    .flatMap((k) => (v.produtos_60d[k] || []).map((p) => ({ ...p, categoria: k })))
    .slice(0, 20);

  return (
    <DashboardChrome token={params.token} active="vendas" data={data}>
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
        <SimpleTable
          columns={[
            { key: "titulo", label: "Produto" },
            { key: "sku", label: "SKU" },
            { key: "classe", label: "Classe" },
            { key: "fat", label: "Faturamento 60d", align: "right" },
            { key: "acum", label: "% acumulado", align: "right" }
          ]}
          rows={v.curva_abc.slice(0, 20).map((i) => ({
            titulo: i.titulo,
            sku: i.sku,
            classe: <Badge tone={i.classe === "A" ? "good" : i.classe === "B" ? "warn" : "neutral"}>{i.classe}</Badge>,
            fat: formatBRL(i.faturamento_60d),
            acum: formatPct(i.pct_acumulado)
          }))}
        />
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

      <Section title="Pesquisa de mercado" description="Concorrentes monitorados">
        <SimpleTable
          columns={[
            { key: "titulo", label: "Produto" },
            { key: "preco", label: "Preço", align: "right" },
            { key: "visitas", label: "Visitas 30d", align: "right" },
            { key: "fat", label: "Faturamento 30d", align: "right" },
            { key: "conv", label: "Conversão 7d", align: "right" }
          ]}
          rows={v.pesquisa_mercado.map((p) => ({
            titulo: p.titulo,
            preco: formatBRL(p.preco_promocional > 0 ? p.preco_promocional : p.preco),
            visitas: formatNumber(p.visitas_30d),
            fat: formatBRL(p.faturamento_30d),
            conv: formatPct(p.conversao_atual_7d)
          }))}
        />
      </Section>
    </DashboardChrome>
  );
}
