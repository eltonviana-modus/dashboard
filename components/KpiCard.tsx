import { formatDeltaLabel } from "@/lib/format";

export default function KpiCard({
  label,
  value,
  deltaPct,
  hint,
  compact
}: {
  label: string;
  value: string;
  deltaPct?: number;
  hint?: string;
  compact?: boolean;
}) {
  const delta = deltaPct !== undefined ? formatDeltaLabel(deltaPct) : null;
  return (
    <div className={`rounded-lg border border-ink-300/40 bg-surface-1 ${compact ? "p-3" : "p-4"}`}>
      <p className={`font-medium uppercase tracking-wide text-ink-500 ${compact ? "text-[10px]" : "text-xs"}`}>
        {label}
      </p>
      <p className={`font-semibold text-ink-900 ${compact ? "mt-1 text-base" : "mt-2 text-2xl"}`}>{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span className={`font-semibold ${compact ? "text-[11px]" : "text-xs"} ${delta.positive ? "text-good" : "text-bad"}`}>
            {delta.text}
          </span>
        )}
        {hint && <span className="text-xs text-ink-500">{hint}</span>}
      </div>
    </div>
  );
}
