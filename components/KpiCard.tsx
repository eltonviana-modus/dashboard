import { formatDeltaLabel } from "@/lib/format";

export default function KpiCard({
  label,
  value,
  deltaPct,
  hint
}: {
  label: string;
  value: string;
  deltaPct?: number;
  hint?: string;
}) {
  const delta = deltaPct !== undefined ? formatDeltaLabel(deltaPct) : null;
  return (
    <div className="rounded-lg border border-ink-300/40 bg-surface-1 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span className={`text-xs font-semibold ${delta.positive ? "text-good" : "text-bad"}`}>
            {delta.text}
          </span>
        )}
        {hint && <span className="text-xs text-ink-500">{hint}</span>}
      </div>
    </div>
  );
}
