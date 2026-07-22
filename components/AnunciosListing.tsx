"use client";

import Badge from "@/components/Badge";
import TaggedListing from "@/components/TaggedListing";

type Anuncio = { item_id: string; sku: string | number; titulo: string; status: string; estoque: number };

// Status reais gerados pela coleta de anúncios (WF 03a): Ativo, Ativo - Moderado,
// Pausado - Manual, Pausado - Estoque, Pausado - Infracao, Inativo - Revisar (+ "Sem status"
// como fallback). Usar prefixo em vez de igualdade exata pra não perder variantes como
// "Ativo - Moderado" (antes caía como neutro por comparar só com "Ativo").
function toneParaStatus(status: string): "good" | "warn" | "bad" | "neutral" {
  const s = status.toLowerCase();
  if (s.startsWith("ativo")) return "good";
  if (s.startsWith("pausad")) return "warn";
  if (s.startsWith("inativo")) return "bad";
  return "neutral";
}

export default function AnunciosListing({ items, maxHeight }: { items: Anuncio[]; maxHeight?: string | null }) {
  return (
    <TaggedListing
      items={items}
      categoriaKey="status"
      tagLabel={(status) => ({ label: status, tone: toneParaStatus(status) })}
      exportFilename="status_dos_anuncios"
      emptyLabel="Nenhum anúncio encontrado."
      searchKeys={["titulo", "sku"]}
      maxHeight={maxHeight}
      columns={[
        { key: "titulo", label: "Anúncio" },
        { key: "sku", label: "SKU" },
        { key: "status", label: "Status", render: (i) => <Badge tone={toneParaStatus(i.status)}>{i.status}</Badge> },
        { key: "estoque", label: "Estoque", align: "right" }
      ]}
    />
  );
}
