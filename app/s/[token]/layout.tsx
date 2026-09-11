// A validação do token acontece em cada página (geral/vendas/operacao), que já
// busca os dados com o período correto via searchParams. Buscar aqui de novo
// duplicava a chamada ao webhook em toda navegação — removido de propósito.
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
