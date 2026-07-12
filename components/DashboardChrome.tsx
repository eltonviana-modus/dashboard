import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import PeriodFilter from "@/components/PeriodFilter";
import type { DashboardData } from "@/lib/api";
import { formatDateBR } from "@/lib/format";

export default function DashboardChrome({
  token,
  active,
  data,
  children
}: {
  token: string;
  active: "geral" | "vendas" | "operacao";
  data: DashboardData;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-2">
      <Sidebar token={token} active={active} nickname={data.seller.nickname} />
      <div className="pl-60">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-ink-300/40 bg-surface-1 px-8 py-3">
          <div>
            <p className="text-sm font-semibold text-ink-900">{data.seller.nickname}</p>
            <p className="text-xs text-ink-500">
              {formatDateBR(data.periodo.atual.inicio)} – {formatDateBR(data.periodo.atual.fim)}
              <span className="mx-2 text-ink-300">·</span>
              Comparando com {formatDateBR(data.periodo.anterior.inicio)} – {formatDateBR(data.periodo.anterior.fim)}
            </p>
          </div>
          <Suspense fallback={null}>
            <PeriodFilter />
          </Suspense>
        </header>
        <main className="space-y-6 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
