import Sidebar from "@/components/Sidebar";
import type { DashboardData } from "@/lib/api";

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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-300/40 bg-surface-1 px-8">
          <div>
            <p className="text-sm font-semibold text-ink-900">{data.seller.nickname}</p>
            <p className="text-xs text-ink-500">
              Período: {data.periodo.atual.inicio.split("-").reverse().join("/")} –{" "}
              {data.periodo.atual.fim.split("-").reverse().join("/")}
            </p>
          </div>
        </header>
        <main className="space-y-6 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
