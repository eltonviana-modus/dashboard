const NIVEIS = [
  { key: "vermelho", label: "Baixa", color: "#dc2626" },
  { key: "laranja", label: "Regular", color: "#f97316" },
  { key: "amarelo", label: "Boa", color: "#eab308" },
  { key: "verde", label: "Muito boa", color: "#22c55e" },
  { key: "verde-escuro", label: "Excelente", color: "#15803d" }
];

function nivelIndex(nivelReputacao: string): number {
  const s = (nivelReputacao || "").toLowerCase();
  if (s.includes("excelente") || s.includes("verde escuro") || s.includes("verde-escuro")) return 4;
  if (s.includes("verde")) return 3;
  if (s.includes("amarel")) return 2;
  if (s.includes("laranj")) return 1;
  if (s.includes("vermelh") || s.includes("baix")) return 0;
  return -1;
}

export default function ReputacaoTermometro({ nivelReputacao }: { nivelReputacao: string }) {
  const idx = nivelIndex(nivelReputacao);

  return (
    <div className="w-full">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {NIVEIS.map((n, i) => (
          <div
            key={n.key}
            className="flex-1"
            style={{ backgroundColor: n.color, opacity: idx === -1 ? 0.35 : i <= idx ? 1 : 0.2 }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-4">
        {idx >= 0 && (
          <div
            className="absolute -top-[7px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-white shadow"
            style={{ left: `${((idx + 0.5) / NIVEIS.length) * 100}%`, backgroundColor: NIVEIS[idx].color }}
          />
        )}
      </div>
      <p className="mt-0.5 text-xs font-medium text-ink-900">
        {idx >= 0 ? NIVEIS[idx].label : nivelReputacao || "Sem dado"}
      </p>
    </div>
  );
}
