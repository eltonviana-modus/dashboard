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
        <KpiCard label="Repasses recebidos" value={formatBRL(f.repasses_total)} hint="Já pago pelo Mercado Livre" />
      </div>

      <Section
        title="Previsão de repasses"
        description="Valores já pagos e previstos pelo Mercado Livre, por dia de liberação — janela fixa (não segue o filtro de data acima, pois é uma visão de fluxo de caixa futuro)"
      >
        <RepassesChart data={f.serie_repasses} />
      </Section>

      <Section title="Vendas por dia de pagamento" description="Detalhe dos pedidos que compõem cada dia de repasse, já pago ou previsto">
        <PagamentosTable vendasPorDiaPagamento={f.vendas_por_dia_pagamento} />
      </Section>
    </DashboardChrome>
  );
}
