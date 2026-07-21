import CsvExportButton from "@/components/CsvExportButton";
import type { CsvColumn } from "@/lib/csv";

export default function SimpleTable({
  columns,
  rows,
  emptyLabel = "Sem dados no período.",
  maxHeight = "18rem",
  exportFilename,
  exportColumns,
  exportRows
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, React.ReactNode>[];
  emptyLabel?: string;
  maxHeight?: string | null;
  exportFilename?: string;
  exportColumns?: CsvColumn[];
  exportRows?: Record<string, unknown>[];
}) {
  const showExport = !!exportFilename && !!exportRows && exportRows.length > 0;

  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-ink-500">{emptyLabel}</p>;
  }

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
            {rows.map((row, i) => (
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
    </div>
  );
}
