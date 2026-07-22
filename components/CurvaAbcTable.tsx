"use client";

import { useMemo, useState } from "react";
import SimpleTable from "@/components/SimpleTable";
import Badge from "@/components/Badge";
import { formatBRL, formatPct } from "@/lib/format";

type CurvaItem = {
  item_id: string;
  sku: string | number;
  titulo: string;
  faturamento_60d: number;
  pct_acumulado: number;
  classe: "A" | "B" | "C";
};

const CLASSE_TONE: Record<string, "good" | "warn" | "neutral"> = {
  A: "good",
  B: "warn",
  C: "neutral"
};

export default function CurvaAbcTable({ items }: { items: CurvaItem[] }) {
  const [filtro, setFiltro] = useState<"A" | "B" | "C" | null>(null);

  const contagem = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0 };
    for (const i of items) c[i.classe] = (c[i.classe] || 0) + 1;
    return c;
  }, [items]);

  const filtrados = filtro ? items.filter((i) => i.classe === filtro) : items;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["A", "B", "C"] as const).map((classe) => (
          <button
            key={classe}
            onClick={() => setFiltro((f) => (f === classe ? null : classe))}
            className={`rounded-full transition-opacity ${filtro && filtro !== classe ? "opacity-40" : "opacity-100"}`}
          >
            <Badge tone={CLASSE_TONE[classe]}>
              Classe {classe} ({contagem[classe] || 0})
            </Badge>
          </button>
        ))}
        {filtro && (
          <button onClick={() => setFiltro(null)} className="text-xs text-ink-500 underline hover:text-ink-700">
            limpar filtro
          </button>
        )}
      </div>
      <SimpleTable
        key={filtro ?? "all"}
        exportFilename="curva_abc"
        exportColumns={[
          { key: "sku", label: "SKU" },
          { key: "titulo", label: "Produto" },
          { key: "classe", label: "Classe" },
          { key: "fat", label: "Faturamento 60d" },
          { key: "acum", label: "% acumulado" }
        ]}
        exportRows={filtrados.map((i) => ({
          sku: i.sku,
          titulo: i.titulo,
          classe: i.classe,
          fat: i.faturamento_60d,
          acum: i.pct_acumulado
        }))}
        columns={[
          { key: "sku", label: "SKU" },
          { key: "titulo", label: "Produto" },
          { key: "classe", label: "Classe" },
          { key: "fat", label: "Faturamento 60d", align: "right" },
          { key: "acum", label: "% acumulado", align: "right" }
        ]}
        rows={filtrados.map((i) => ({
          sku: i.sku,
          titulo: i.titulo,
          classe: <Badge tone={CLASSE_TONE[i.classe]}>{i.classe}</Badge>,
          fat: formatBRL(i.faturamento_60d),
          acum: formatPct(i.pct_acumulado)
        }))}
      />
    </div>
  );
}
