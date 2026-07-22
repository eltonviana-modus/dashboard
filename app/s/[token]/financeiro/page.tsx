import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";
import DashboardChrome from "@/components/DashboardChrome";
import Section from "@/components/Section";
import KpiCard from "@/components/KpiCard";
import FinanceiroWaterfall from "@/components/FinanceiroWaterfall";
import RepassesChart from "@/components/RepassesChart";
import PagamentosTable from "@/components/PagamentosTable";
import { formatBRL } from "@/lib/format";

export default async function FinanceiroPage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { range?: string; start?: string; end?: string };
}) {
  const data = await getDashboardData(params.token, searchParams);
  if (!data) notFound();

  const f = data.financeiro;

  return (
    <DashboardChrome token={params.token} active="financeiro" data={data}>
      <Section title="Resultado do período" description="Faturamento bruto até o lucro líquido, na mesma janela de datas selecionada acima">
        <FinanceiroWaterfall
          faturamento={f.faturamento}
          despesaFrete={f.despesa_frete}
          despesaComissao={f.despesa_comissao}
          faturamentoLiquido={f.faturamento_liquido}
        />
      </Section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Repasses recebidos" value={formatBRL(f.repasses_total)} hint="Pago pelo Mercado Livre no período selecionado" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Pagamentos já realizados" description="Repasses recebidos do Mercado Livre, por dia de liberação — segue o filtro de data selecionado acima">
          <RepassesChart
            data={f.serie_pagos}
            color="#16a34a"
            label="Já pago"
            emptyMessage="Nenhum pagamento recebido no período selecionado."
          />
        </Section>
        <Section title="Previsão de repasse (próximos 20 dias)" description="Valores ainda a liberar pelo Mercado Livre — janela fixa dos próximos 20 dias, não segue o filtro de data acima">
          <RepassesChart
            data={f.serie_previstos}
            color="#2563eb"
            label="Previsto"
            emptyMessage="Nenhuma previsão de pagamento nos próximos 20 dias."
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Vendas dos pagamentos já realizados" description="Pedidos que compõem os repasses já recebidos, no período selecionado">
          <PagamentosTable vendasPorDiaPagamento={f.vendas_pagos_por_dia} emptyLabel="Nenhum pagamento recebido no período." />
        </Section>
        <Section title="Vendas da previsão de repasse" description="Pedidos que compõem a previsão dos próximos 20 dias">
          <PagamentosTable vendasPorDiaPagamento={f.vendas_previstos_por_dia} emptyLabel="Nenhuma previsão nos próximos 20 dias." />
        </Section>
      </div>
    </DashboardChrome>
  );
}
