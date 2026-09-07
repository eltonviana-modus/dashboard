"use client";

import { Download } from "lucide-react";
import { downloadCsv, type CsvColumn } from "@/lib/csv";

export default function CsvExportButton({
  filename,
  columns,
  rows,
  label = "Exportar CSV"
}: {
  filename: string;
  columns: CsvColumn[];
  rows: Record<string, unknown>[];
  label?: string;
}) {
  if (!rows || !rows.length) return null;
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, columns, rows)}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-ink-300/40 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-surface-2"
    >
      <Download size={13} />
      {label}
    </button>
  );
}
