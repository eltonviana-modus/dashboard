export type DashboardData = {
  seller: { nickname: string; seller_id: number | string };
  periodo: {
    atual: { inicio: string; fim: string };
    anterior: { inicio: string; fim: string };
    dias: number;
  };
  geral: {
    faturamento: number;
    faturamento_delta_pct: number;
    pedidos: number;
    pedidos_delta_pct: number;
    ticket_medio: number;
    ticket_medio_delta_pct: number;
    visitas: number;
    visitas_delta_pct: number;
    taxa_conversao: number;
    taxa_conversao_delta_pct: number;
    saude_conta: {
      nivel_reputacao: string;
      medalha: string;
      mediacoes_abertas: number;
      tx_cancelamento: number;
      avaliacao_positiva: number;
      tx_reclamacao: number;
      tx_atraso: number;
      reclamacoes_abertas: number;
    };
    relatorio_gerente_geral: string | null;
    relatorio_data: string | null;
    resumo_automacao: {
      anuncios_ativos: number;
      acoes_pendentes: number;
      alertas_alta_prioridade: number;
    };
  };
  vendas: {
    serie_faturamento_diario: { data: string; faturamento: number }[];
    curva_abc: {
      item_id: string;
      sku: string | number;
      titulo: string;
      faturamento_60d: number;
      pct_acumulado: number;
      classe: "A" | "B" | "C";
    }[];
    trafego_por_item: { item_id: string; visitas: number; pedidos: number; conversao_pct: number }[];
    produtos_60d: Record<string, { item_id: string; sku: string | number; titulo: string; estoque_disponivel: number; giro_60d: number; cobertura_dias: number }[]>;
    produtos_60d_resumo: Record<string, number>;
    pesquisa_mercado: {
      item_id: string; sku: string | number; titulo: string; preco: number; preco_promocional: number;
      visitas_30d: number; faturamento_30d: number; conversao_atual_7d: number; conversao_anterior_7d: number;
    }[];
    preco_risco: { item_id: string; sku: string | number; titulo: string; diferenca_pct: number; menor_preco_concorrente: number; link?: string }[];
    preco_oportunidade: { item_id: string; sku: string | number; titulo: string; diferenca_pct: number; menor_preco_concorrente: number }[];
  };
  operacao: {
    anuncios_por_status: Record<string, number>;
    total_anuncios: number;
    acoes_por_prioridade: Record<string, {
      sku: string | number; item_id: string; produto: string; categoria: string; problema: string;
      acao_recomendada: string; responsavel: string; impacto_estimado: string; data_criacao: string;
    }[]>;
    produtos_problematicos: Record<string, { item_id: string; sku?: string | number; titulo: string }[]>;
    reclamacoes_por_produto: { produto: string; sku?: string | number; total: number; motivos: Record<string, number> }[];
    reclamacoes_por_motivo: Record<string, number>;
    total_reclamacoes: number;
    total_devolucoes: number;
    ads_resumo: Record<string, number>;
    ads_performance: { item_id: string; sku: string | number; titulo: string; roas: number; acos: number; margem_pct: number; custo_ads: number; classificacao: string }[];
  };
};

const API_BASE = process.env.DASHBOARD_API_URL || "https://n8n-consult-n8n.k7je8d.easypanel.host/webhook/dashboard-data";

export async function getDashboardData(token: string, days = 30): Promise<DashboardData | null> {
  try {
    const url = `${API_BASE}?token=${encodeURIComponent(token)}&days=${days}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as DashboardData;
  } catch {
    return null;
  }
}
