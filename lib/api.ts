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
      acoes_identificadas_7d?: number;
      acoes_resolvidas_7d?: number;
      taxa_resolucao_7d_pct?: number | null;
      tempo_medio_resolucao_dias?: number | null;
      perguntas_respondidas_ia?: number;
      perguntas_respondidas_total?: number;
      perguntas_recebidas_periodo?: number;
    };
  };
  vendas: {
    serie_faturamento_diario: { data: string; faturamento: number }[];
    serie_visitas_diario: { data: string; visitas: number }[];
    vendas_por_dia: Record<string, { produto: string; sku: string | number; valor: number; pedidos: number }[]>;
    visitas_por_dia: Record<string, { item_id: string; titulo: string; sku: string | number; visitas: number }[]>;
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
    produtos_60d_lista: { item_id: string; sku: string | number; titulo: string; estoque_disponivel: number; giro_60d: number; cobertura_dias: number; categoria: string }[];
    produtos_problematicos_lista: {
      item_id: string; sku: string | number; titulo: string; estoque_disponivel: number;
      visitas_7d: number; vendas_7d: number; conversao_pct: number; categoria: string;
      variacao_visitas_pct?: number; dias_sem_estoque?: number; faturamento_perdido_estimado?: number;
    }[];
    pesquisa_mercado: {
      item_id: string; sku: string | number; titulo: string; preco: number; preco_promocional: number;
      visitas_30d: number; faturamento_30d: number; conversao_atual_7d: number; conversao_anterior_7d: number;
    }[];
    preco_risco: { item_id: string; sku: string | number; titulo: string; diferenca_pct: number; menor_preco_concorrente: number; link?: string }[];
    preco_oportunidade: { item_id: string; sku: string | number; titulo: string; diferenca_pct: number; menor_preco_concorrente: number }[];
  };
  campanhas: {
    disponiveis: number;
    participando: number;
    por_campanha: { nome: string; disponiveis: number; participando: number }[];
  };
  operacao: {
    anuncios_por_status: Record<string, number>;
    anuncios_lista: { item_id: string; sku: string | number; titulo: string; status: string; estoque: number }[];
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
    devolucoes_por_motivo: Record<string, number>;
    ads_resumo: Record<string, number>;
    ads_performance: { item_id: string; sku: string | number; titulo: string; roas: number; acos: number; margem_pct: number; custo_ads: number; classificacao: string }[];
  };
};

export type RangeKey = "hoje" | "ontem" | "7d" | "mes_atual" | "mes_passado" | "custom";

export type PeriodParams = {
  range?: string;
  start?: string;
  end?: string;
};

const API_BASE = process.env.DASHBOARD_API_URL || "https://n8n-consult-n8n.k7je8d.easypanel.host/webhook/dashboard-data";

export async function getDashboardData(token: string, period: PeriodParams = {}): Promise<DashboardData | null> {
  try {
    const range = period.range || "7d";
    const qs = new URLSearchParams({ token, range });
    if (range === "custom" && period.start && period.end) {
      qs.set("start", period.start);
      qs.set("end", period.end);
    }
    const url = `${API_BASE}?${qs.toString()}`;
    // Os dados vêm de pipelines batch (atualização a cada poucos minutos/horas), não em
    // tempo real. Um revalidate curto evita bater no webhook/Postgres a cada navegação
    // de aba ou clique de período, sem perder frescor perceptível.
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()) as DashboardData;
  } catch {
    return null;
  }
}
