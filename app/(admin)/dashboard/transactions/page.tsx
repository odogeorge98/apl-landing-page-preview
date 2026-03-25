import { redirect } from "next/navigation";

export default function TransactionsIndexPage() {
  redirect("/dashboard/transactions/drivers");
}
