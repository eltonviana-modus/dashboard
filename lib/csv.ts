export type CsvColumn = { key: string; label: string };

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",;\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(columns: CsvColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(";");
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(row[c.key])).join(";"));
  return "﻿" + [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, columns: CsvColumn[], rows: Record<string, unknown>[]) {
  if (typeof window === "undefined") return;
  const csv = buildCsv(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
