import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Settings2, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { href: "geral", label: "Geral", icon: LayoutDashboard },
  { href: "vendas", label: "Vendas", icon: ShoppingCart },
  { href: "operacao", label: "Operação", icon: Settings2 },
  { href: "financeiro", label: "Financeiro", icon: Wallet }
];

export default function Sidebar({
  token,
  active,
  nickname
}: {
  token: string;
  active: "geral" | "vendas" | "operacao" | "financeiro";
  nickname: string;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-stone-200 bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600 text-sm font-bold text-white">
          C
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink-900">Dashboard</p>
          <p className="truncate text-xs text-ink-500">{nickname}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === active;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`/s/${token}/${item.href}`}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-accent-600 text-white" : "text-ink-700 hover:bg-sidebar-hover hover:text-ink-900"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-200 px-5 py-4">
        <p className="text-[11px] leading-snug text-ink-500/70">
          Painel gerado automaticamente pela automação de dados da consultoria.
        </p>
      </div>
    </aside>
  );
}
