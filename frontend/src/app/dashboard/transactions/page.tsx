import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import GameButton from "@/components/GameButton";
import { stats, transactions } from "@/lib/demoData";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-HN", { day: "numeric", month: "short" });

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
            <Wallet className="text-mh-green" /> Movimientos
          </h1>
          <p className="mt-1 text-mh-dark/60">
            Balance actual: <span className="font-bold text-mh-dark">{currency.format(stats.balance)}</span>
          </p>
        </div>
        <GameButton variant="primary">+ Nueva transacción</GameButton>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border-2 border-mh-dark/5 bg-white p-2 sm:p-4">
        {transactions.map((transaction) => {
          const isIncome = transaction.amount > 0;
          return (
            <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-mh-dark">{transaction.title}</p>
                  <p className="text-xs text-mh-dark/50">
                    {transaction.category} · {dateFormatter.format(new Date(transaction.date))}
                  </p>
                </div>
              </div>
              <span className={`font-display text-lg font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
                {isIncome ? "+" : ""}
                {currency.format(transaction.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
