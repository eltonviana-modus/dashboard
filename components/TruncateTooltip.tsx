"use client";

/**
 * Célula de tabela com texto longo: trunca visualmente numa largura máxima e mostra o texto
 * completo num balão nativo (title="...") ao passar o mouse. Usado pela coluna "Resolução"
 * (texto explicando a decisão final do ML numa claim fechada) nas listas de reclamação/
 * devolução, que pode ser bem longo. Pedido do Elton em 2026-07-31.
 */
export default function TruncateTooltip({
  text,
  maxWidth = "16rem"
}: {
  text: string | null | undefined;
  maxWidth?: string;
}) {
  if (!text) return <span className="text-ink-500">-</span>;
  return (
    <span
      title={text}
      className="block cursor-help truncate align-bottom"
      style={{ maxWidth }}
    >
      {text}
    </span>
  );
}
