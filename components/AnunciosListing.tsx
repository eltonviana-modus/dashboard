"use client";

import Badge from "@/components/Badge";
import TaggedListing from "@/components/TaggedListing";

type Anuncio = { item_id: string; sku: string | number; titulo: string; status: string; estoque: number };

function toneParaStatus(status: string): "good" | "warn" | "bad" | "neutral" {
  if (status === "Ativo") return "good";
  if (status.toLowerCase().includes("pausad")) return "warn";
  if (status.toLowerCase().includes("finaliz") || status.toLowerCase().includes("fechad")) return "bad";
  return "neutral";
}

export default function AnunciosListing({ items }: { items: Anuncio[] }) {
  return (
    <TaggedListing
      items={items}
      categoriaKey="status"
      tagLabel={(status) => ({ label: status, tone: toneParaStatus(status) })}
      exportFilename="status_dos_anuncios"
      emptyLabel="Nenhum anúncio encontrado."
      searchKeys={["titulo", "sku"]}
      columns={[
        { key: "titulo", label: "Anúncio" },
        { key: "sku", label: "SKU" },
        { key: "status", label: "Status", render: (i) => <Badge tone={toneParaStatus(i.status)}>{i.status}</Badge> },
        { key: "estoque", label: "Estoque", align: "right" }
      ]}
    />
  );
}
