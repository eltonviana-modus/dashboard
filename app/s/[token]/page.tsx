import { redirect } from "next/navigation";

export default function SellerRoot({ params }: { params: { token: string } }) {
  redirect(`/s/${params.token}/geral`);
}
