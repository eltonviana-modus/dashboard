"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Badge from "@/components/Badge";
import SimpleTable from "@/components/SimpleTable";
import type { CsvColumn } from "@/lib/csv";

export type TagTone = "good" | "warn" | "bad" | "neutral";

export type TaggedListingColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  render?: (item: T) => React.ReactNode;
  value?: (item: T) => string | number | null | undefined;
};

export default function TaggedListing<T extends Record<string, any>>({
  items,
  categoriaKey,
  tagLabel,
  columns,
  emptyLabel = "Nenhum item encontrado.",
  maxHeight = "20rem",
  exportFilename,
  searchKeys
}: {
  items: T[];
  categoriaKey: keyof T;
  tagLabel: (categoria: string) => { label: string; tone: TagTone };
  columns: TaggedListingColumn<T>[];
  emptyLabel?: string;
  maxHeight?: string | null;
  exportFilename?: string;
  searchKeys?: (keyof T)[];
}) {
  const [filtro, setFiltro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  // useDeferredValue mantém o input responsivo e adia o refiltro/remapeamento
  // de listas grandes (centenas de SKUs) pra fora do caminho crítico de digitação.
  const deferredBusca = useDeferredValue(busca);

  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const item of items) {
      const cat = String(item[categoriaKey] ?? "");
      if (!cat) continue;
      c[cat] = (c[cat] || 0) + 1;
    }
    return c;
  }, [items, categoriaKey]);

  const categorias = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a]);

  const filtrados = useMemo(() => {
    let out = filtro ? items.filter((i) => String(i[categoriaKey] ?? "") === filtro) : items;
    if (deferredBusca.trim() && searchKeys?.length) {
      const termo = deferredBusca.trim().toLowerCase();
      out = out.filter((i) => searchKeys.some((k) => String(i[k] ?? "").toLowerCase().includes(termo)));
    }
    return out;
  }, [items, filtro, categoriaKey, deferredBusca, searchKeys]);

  const exportColumns: CsvColumn[] = columns.map((c) => ({ key: c.key, label: c.label }));
  const exportRows = filtrados.map((item) => {
    const row: Record<string, unknown> = {};
    for (const c of columns) {
      row[c.key] = c.value ? c.value(item) : (item as any)[c.key];
    }
    return row;
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {categorias.map((cat) => {
          const t = tagLabel(cat);
          const active = filtro === cat;
          return (
            <button
              key={cat}
              onClick={() => setFiltro((f) => (f === cat ? null : cat))}
              aria-pressed={active}
              className={`rounded-full transition-opacity ${filtro && !active ? "opacity-40" : "opacity-100"}`}
            >
              <Badge tone={t.tone}>
                {t.label} ({contagem[cat]})
              </Badge>
            </button>
          );
        })}
        {filtro && (
          <button onClick={() => setFiltro(null)} className="text-xs text-ink-500 underline hover:text-ink-700">
            limpar filtro
          </button>
        )}
        {searchKeys?.length ? (
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar na listagem"
            className="ml-auto w-40 rounded-md border border-ink-300/40 bg-surface-1 px-2 py-1 text-xs text-ink-700 outline-none focus:border-ink-500"
          />
        ) : null}
      </div>
      <SimpleTable
        key={`${filtro ?? "all"}::${deferredBusca}`}
        emptyLabel={emptyLabel}
        maxHeight={maxHeight}
        exportFilename={exportFilename}
        exportColumns={exportColumns}
        exportRows={exportRows}
        columns={columns.map((c) => ({ key: c.key, label: c.label, align: c.align }))}
        rows={filtrados.map((item) => {
          const row: Record<string, React.ReactNode> = {};
          for (const c of columns) {
            row[c.key] = c.render ? c.render(item) : (item as any)[c.key];
          }
          return row;
        })}
      />
    </div>
  );
}
