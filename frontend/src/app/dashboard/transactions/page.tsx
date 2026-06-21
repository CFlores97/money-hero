import { redirect } from "next/navigation";

export default function LegacyDashboardTransactionsPage() {
  redirect("/transactions");
}
