import Link from "next/link";

const NAV_ITEMS = [
  { href: "geral", label: "Geral", icon: "◧" },
  { href: "vendas", label: "Vendas", icon: "◨" },
  { href: "operacao", label: "Operação", icon: "◩" }
];

export default function Sidebar({
  token,
  active,
  nickname
}: {
  token: string;
  active: "geral" | "vendas" | "operacao";
  nickname: string;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600 text-sm font-bold">
          C
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Consultoria ML</p>
          <p className="truncate text-xs text-white/50">{nickname}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === active;
          return (
            <Link
              key={item.href}
              href={`/s/${token}/${item.href}`}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-accent-600 text-white" : "text-white/70 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-snug text-white/40">
          Painel gerado automaticamente pela automação de dados da consultoria.
        </p>
      </div>
    </aside>
  );
}
