"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, X } from "lucide-react";
import GameButton from "@/components/GameButton";
import { stats, transactions as demoTransactions } from "@/lib/demoData";
import { ApiError, createTransaction, getCategories, type Category } from "@/lib/api";
import { getToken } from "@/lib/session";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-HN", { day: "numeric", month: "short" });

interface DisplayTransaction {
  id: string | number;
  title: string;
  category: string;
  date: string;
  amount: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<DisplayTransaction[]>(demoTransactions);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Token lives in localStorage, only readable client-side after mount.
    const storedToken = getToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(storedToken);

    if (storedToken) {
      getCategories(storedToken)
        .then(setCategories)
        .catch(() => setCategories([]));
    }
  }, []);

  const availableCategories = categories.filter(
    (category) => category.type === type || category.type === "both"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setLoading(true);

    try {
      await createTransaction(token, {
        type,
        amount: Number(amount),
        categoryId,
        date,
        description: description || null,
      });

      const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "Otro";

      setTransactions((prev) => [
        {
          id: crypto.randomUUID(),
          title: description || categoryName,
          category: categoryName,
          date,
          amount: type === "income" ? Number(amount) : -Number(amount),
        },
        ...prev,
      ]);

      setAmount("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la transacción.");
    } finally {
      setLoading(false);
    }
  }

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
        <GameButton variant="primary" onClick={() => setShowForm(true)}>
          + Nueva transacción
        </GameButton>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-mh-dark">Nueva transacción</h2>
              <button onClick={() => setShowForm(false)} className="text-mh-dark/40 hover:text-mh-dark">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold ${
                    type === "expense"
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-mh-dark/10 text-mh-dark/50"
                  }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold ${
                    type === "income"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                      : "border-mh-dark/10 text-mh-dark/50"
                  }`}
                >
                  Ingreso
                </button>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Monto (L)</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Categoría</span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Fecha</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                  Descripción (opcional)
                </span>
                <input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                />
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>
              )}

              <GameButton type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar transacción"}
              </GameButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
