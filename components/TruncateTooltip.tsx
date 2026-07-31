"use client";

/**
 * Célula de tabela com texto longo: coluna estreita com o texto quebrando em várias linhas (até
 * `maxLines`), em vez de truncar numa linha só só — mantém o texto legível de cara sem precisar
 * passar o mouse, e sem espremer as colunas vizinhas (ex: "Produto") com uma linha única muito
 * larga. Quando o texto passa de `maxLines`, corta com reticências e o balão nativo (title="...")
 * mostra o resto ao passar o mouse. Usado pela coluna "Resolução" (texto explicando a decisão
 * final do ML numa claim fechada) nas listas de reclamação/devolução. Pedido do Elton em
 * 2026-07-31, revisado no mesmo dia pra virar quebra de linha em vez de truncar numa linha só.
 */
export default function TruncateTooltip({
  text,
  maxWidth = "13rem",
  maxLines = 3
}: {
  text: string | null | undefined;
  maxWidth?: string;
  maxLines?: number;
}) {
  if (!text) return <span className="text-ink-500">-</span>;
  return (
    <span
      title={text}
      className="block cursor-help align-bottom leading-snug"
      style={{
        maxWidth,
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        whiteSpace: "normal",
        wordBreak: "break-word"
      }}
    >
      {text}
    </span>
  );
}
