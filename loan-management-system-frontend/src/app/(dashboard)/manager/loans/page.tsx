import { redirect } from "next/navigation";

export default function ManagerLoansRootPage() {
  redirect("/manager/loans/pending");
}
