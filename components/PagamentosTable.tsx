import SimpleTable from "@/components/SimpleTable";
import Badge from "@/components/Badge";
import { formatBRL, formatDateBR } from "@/lib/format";
import type { DashboardData } from "@/lib/api";

export default function PagamentosTable({
  vendasPorDiaPagamento
}: {
  vendasPorDiaPagamento: DashboardData["financeiro"]["vendas_por_dia_pagamento"];
}) {
  const dias = Object.keys(vendasPorDiaPagamento).sort();
  const flat = dias.flatMap((dia) =>
    vendasPorDiaPagamento[dia].map((v) => ({ ...v, data_pagamento: dia }))
  );

  const columns = [
    { key: "data_pagamento", label: "Data pagamento" },
    { key: "numero_pedido", label: "Pedido" },
    { key: "sku", label: "SKU" },
    { key: "produto", label: "Produto" },
    { key: "valor", label: "Valor", align: "right" as const },
    { key: "comissao", label: "Comissão", align: "right" as const },
    { key: "status", label: "Status" }
  ];

  const rows = flat
    .sort((a, b) => a.data_pagamento.localeCompare(b.data_pagamento))
    .map((v) => {
      const pago = v.status_liberacao === "released";
      return {
        data_pagamento: formatDateBR(v.data_pagamento),
        numero_pedido: v.numero_pedido,
        sku: v.sku,
        produto: <span className="line-clamp-1 max-w-xs">{v.produto}</span>,
        valor: formatBRL(v.valor),
        comissao: formatBRL(v.comissao),
        status: <Badge tone={pago ? "good" : "warn"}>{pago ? "Pago" : "Previsto"}</Badge>
      };
    });

  const exportRows = flat.map((v) => ({
    data_pagamento: v.data_pagamento,
    numero_pedido: v.numero_pedido,
    sku: v.sku,
    produto: v.produto,
    valor: v.valor,
    comissao: v.comissao,
    status: v.status_liberacao === "released" ? "Pago" : "Previsto"
  }));

  return (
    <SimpleTable
      columns={columns}
      rows={rows}
      emptyLabel="Nenhum pagamento previsto ou recebido no período."
      maxHeight="24rem"
      exportFilename="pagamentos-mercado-livre"
      exportColumns={columns.map((c) => ({ key: c.key, label: c.label }))}
      exportRows={exportRows}
    />
  );
}
