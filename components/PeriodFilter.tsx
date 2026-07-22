"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

const PRESETS: { key: string; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "ontem", label: "Ontem" },
  { key: "7d", label: "7 dias" },
  { key: "mes_atual", label: "Este mês" },
  { key: "mes_passado", label: "Mês passado" }
];

export default function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRange = searchParams.get("range") || "7d";
  const isCustom = currentRange === "custom";
  const [showCustom, setShowCustom] = useState(isCustom);
  const [start, setStart] = useState(searchParams.get("start") || "");
  const [end, setEnd] = useState(searchParams.get("end") || "");
  const [dateError, setDateError] = useState<string | null>(null);

  function applyRange(range: string) {
    setShowCustom(false);
    startTransition(() => {
      router.push(`${pathname}?range=${range}`);
    });
  }

  function applyCustom() {
    if (!start || !end) {
      setDateError("Preencha as duas datas.");
      return;
    }
    if (start > end) {
      setDateError("A data inicial precisa ser antes da data final.");
      return;
    }
    setDateError(null);
    const qs = new URLSearchParams({ range: "custom", start, end });
    startTransition(() => {
      router.push(`${pathname}?${qs.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {isPending && <Loader2 size={14} className="animate-spin text-ink-500" aria-hidden />}
      {PRESETS.map((p) => {
        const active = currentRange === p.key && !showCustom;
        return (
          <button
            key={p.key}
            onClick={() => applyRange(p.key)}
            aria-pressed={active}
            disabled={isPending}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
              active ? "bg-accent-600 text-white" : "bg-surface-3 text-ink-700 hover:bg-ink-300/30"
            }`}
          >
            {p.label}
          </button>
        );
      })}
      <button
        onClick={() => setShowCustom((v) => !v)}
        aria-pressed={isCustom || showCustom}
        disabled={isPending}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
          isCustom || showCustom ? "bg-accent-600 text-white" : "bg-surface-3 text-ink-700 hover:bg-ink-300/30"
        }`}
      >
        Período
      </button>

      {showCustom && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 rounded-md border border-ink-300/40 bg-surface-1 px-2 py-1">
            <input
              type="date"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setDateError(null);
              }}
              aria-label="Data inicial"
              max={end || undefined}
              className="rounded border border-ink-300/40 px-1.5 py-1 text-xs text-ink-900"
            />
            <span className="text-xs text-ink-500">até</span>
            <input
              type="date"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setDateError(null);
              }}
              aria-label="Data final"
              min={start || undefined}
              className="rounded border border-ink-300/40 px-1.5 py-1 text-xs text-ink-900"
            />
            <button
              onClick={applyCustom}
              disabled={isPending}
              className="rounded-md bg-accent-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-accent-700 disabled:cursor-wait disabled:opacity-70"
            >
              Aplicar
            </button>
          </div>
          {dateError && (
            <p role="alert" className="text-xs text-bad">
              {dateError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
