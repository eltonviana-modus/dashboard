"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CsvExportButton from "@/components/CsvExportButton";
import type { CsvColumn } from "@/lib/csv";

const DEFAULT_PAGE_SIZE = 50;

export default function SimpleTable({
  columns,
  rows,
  emptyLabel = "Sem dados no período.",
  maxHeight = "18rem",
  exportFilename,
  exportColumns,
  exportRows,
  pageSize = DEFAULT_PAGE_SIZE
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, React.ReactNode>[];
  emptyLabel?: string;
  maxHeight?: string | null;
  exportFilename?: string;
  exportColumns?: CsvColumn[];
  exportRows?: Record<string, unknown>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const showExport = !!exportFilename && !!exportRows && exportRows.length > 0;

  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-ink-500">{emptyLabel}</p>;
  }

  // Renderizar centenas/milhares de linhas de uma vez pesa no DOM e no scroll —
  // pagina no cliente (os dados já estão todos em memória, o export CSV continua
  // usando exportRows/rows completos, sem paginação).
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      {showExport && (
        <div className="mb-2 flex justify-end">
          <CsvExportButton filename={exportFilename!} columns={exportColumns || columns} rows={exportRows!} />
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full text-sm">
          <thead>
            <tr className="sticky top-0 z-[1] border-b border-ink-300/40 bg-surface-1 text-xs uppercase tracking-wide text-ink-500">
              {columns.map((c) => (
                <th key={c.key} className={`px-2 py-2 font-medium ${c.align === "right" ? "text-right" : "text-left"}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr key={i} className="border-b border-ink-300/20 last:border-0 hover:bg-surface-2">
                {columns.map((c) => (
                  <td key={c.key} className={`px-2 py-2 text-ink-700 ${c.align === "right" ? "text-right" : "text-left"}`}>
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
          <span>
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, rows.length)} de {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
              className="rounded-md border border-ink-300/40 p-1 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-surface-2"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-1">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
              className="rounded-md border border-ink-300/40 p-1 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-surface-2"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
