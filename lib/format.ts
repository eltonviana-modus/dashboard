export function formatBRL(v: number): string {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPct(v: number, digits = 1): string {
  return `${(v || 0).toFixed(digits)}%`;
}

export function formatNumber(v: number): string {
  return (v || 0).toLocaleString("pt-BR");
}

export function formatDeltaLabel(v: number): { text: string; positive: boolean } {
  const positive = v >= 0;
  const text = `${positive ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}%`;
  return { text, positive };
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "-";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

// Para campos que sao um TIMESTAMP real (nao so uma data de calendario), como prazo_resposta
// (due_date da claim no ML, em UTC) -- precisa converter pro horario de Brasilia antes de extrair
// o dia, senao prazos proximos da meia-noite UTC aparecem com o dia errado (ex: due_date
// 2026-08-06T02:43:00.000Z e 05/08 as 23:43 em Brasilia, mas formatDateBR() mostraria 06/08).
// Nao usar essa funcao pra datas de calendario puras (data_venda, periodo, series diarias) --
// essas nao tem hora com significado real e devem continuar usando formatDateBR().
export function formatPrazoBR(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return formatDateBR(iso);
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}
