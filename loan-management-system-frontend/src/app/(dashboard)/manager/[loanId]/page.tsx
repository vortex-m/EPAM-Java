import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ loanId: string }>;
};

export default async function ManagerLegacyLoanPage({ params }: PageProps) {
  const { loanId } = await params;
  redirect(`/manager/loans/${loanId}/review`);
}
