import { TrendingUp, Truck, Percent, Wallet, Minus, Equal } from "lucide-react";
import { formatBRL } from "@/lib/format";

type Step = {
  label: string;
  value: number;
  tone: "start" | "decrease" | "end";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  hint?: string;
};

const TONE_STYLES: Record<Step["tone"], { bg: string; text: string; ring: string; iconBg: string }> = {
  start: { bg: "bg-accent-50", text: "text-accent-700", ring: "ring-accent-100", iconBg: "bg-accent-600" },
  decrease: { bg: "bg-bad-bg", text: "text-bad", ring: "ring-red-100", iconBg: "bg-bad" },
  end: { bg: "bg-good-bg", text: "text-good", ring: "ring-green-100", iconBg: "bg-good" }
};

export default function FinanceiroWaterfall({
  faturamento,
  despesaFrete,
  despesaComissao,
  faturamentoLiquido
}: {
  faturamento: number;
  despesaFrete: number;
  despesaComissao: number;
  faturamentoLiquido: number;
}) {
  const steps: Step[] = [
    { label: "Faturamento", value: faturamento, tone: "start", icon: TrendingUp, hint: "Receita bruta do período" },
    { label: "Despesa com frete", value: despesaFrete, tone: "decrease", icon: Truck, hint: "Custo de envio pago ao ML" },
    { label: "Despesa com comissão", value: despesaComissao, tone: "decrease", icon: Percent, hint: "Comissão + tarifa MP + outros custos ML" },
    { label: "Faturamento líquido", value: faturamentoLiquido, tone: "end", icon: Wallet, hint: "Faturamento − frete − comissão" }
  ];

  return (
    <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
      {steps.map((step, i) => {
        const tone = TONE_STYLES[step.tone];
        const Icon = step.icon;
        const isDecrease = step.tone === "decrease";
        return (
          <div key={step.label} className="contents">
            <div className={`rounded-lg p-4 ring-1 ${tone.bg} ${tone.ring}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone.iconBg} text-white`}>
                  <Icon size={15} strokeWidth={2.25} />
                </span>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{step.label}</p>
              </div>
              <p className={`mt-2 text-xl font-semibold ${tone.text}`}>
                {isDecrease && step.value > 0 ? "− " : ""}
                {formatBRL(step.value)}
              </p>
              {step.hint && <p className="mt-1 text-[11px] leading-snug text-ink-500">{step.hint}</p>}
            </div>
            {i < steps.length - 1 && (
              <div className="hidden items-center justify-center text-ink-300 sm:flex" aria-hidden="true">
                {steps[i + 1].tone === "end" ? <Equal size={18} strokeWidth={2.5} /> : <Minus size={18} strokeWidth={2.5} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
