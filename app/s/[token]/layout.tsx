import { getDashboardData } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function SellerLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  const data = await getDashboardData(params.token);
  if (!data) notFound();
  return <>{children}</>;
}
