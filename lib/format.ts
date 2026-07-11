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
