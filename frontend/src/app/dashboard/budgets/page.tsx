"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle, PiggyBank, Trash2, X } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import GameButton from "@/components/GameButton";
import {
  ApiError,
  createBudget,
  deleteBudget,
  getCurrentBudget,
  getCategories,
  type Budget,
  type Category,
} from "@/lib/api";
import { getToken } from "@/lib/session";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
});

const currentMonth = new Date().toISOString().slice(0, 7);

export default function BudgetsPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [limitAmount, setLimitAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
    if (!storedToken) return;

    Promise.all([getCurrentBudget(storedToken), getCategories(storedToken)])
      .then(([b, cats]) => {
        setBudget(b);
        setCategories(cats);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.statusCode === 404) {
          setBudget(null);
        }
        getCategories(storedToken)
          .then(setCategories)
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setSubmitting(true);

    try {
      const newBudget = await createBudget(token, {
        month: currentMonth,
        limitAmount: Number(limitAmount),
        categoryId: categoryId || null,
      });
      setBudget(newBudget);
      setShowForm(false);
      setLimitAmount("");
      setCategoryId("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el presupuesto.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!token || !budget) return;
    setDeleting(true);
    try {
      await deleteBudget(token, budget.id);
      setBudget(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo eliminar el presupuesto.");
    } finally {
      setDeleting(false);
    }
  }

  const isOver80 = budget ? budget.percentageUsed >= 80 : false;
  const isOver100 = budget ? budget.percentageUsed >= 100 : false;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <PiggyBank className="text-mh-green" /> Presupuesto
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Controla cuánto podés gastar este mes.
        </p>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-mh-dark/40">Cargando presupuesto...</p>
      )}

      {!loading && !budget && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-mh-dark/15 bg-white p-10 text-center">
          <PiggyBank size={40} className="text-mh-dark/20" />
          <div>
            <p className="font-display text-lg font-bold text-mh-dark">Sin presupuesto este mes</p>
            <p className="mt-1 text-sm text-mh-dark/50">
              Crea un límite de gasto para {currentMonth} y recibí alertas al acercarte.
            </p>
          </div>
          <GameButton variant="primary" onClick={() => setShowForm(true)}>
            + Crear presupuesto
          </GameButton>
        </div>
      )}

      {!loading && budget && (
        <div className="flex flex-col gap-4">
          {isOver80 && (
            <div
              className={`flex items-start gap-3 rounded-2xl p-4 ${
                isOver100
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold">
                {isOver100
                  ? `¡Superaste tu presupuesto! Gastaste ${currency.format(budget.spentAmount)} de ${currency.format(budget.limitAmount)}.`
                  : `Alcanzaste el ${budget.percentageUsed}% de tu presupuesto. ¡Cuidado con los gastos!`}
              </p>
            </div>
          )}

          {!isOver80 && (
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold">
                Vas bien. Llevás {budget.percentageUsed}% del presupuesto usado.
              </p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-mh-dark/40">
                  Presupuesto — {budget.month}
                </p>
                {budget.categoryId && (
                  <p className="text-xs text-mh-dark/40">
                    {categories.find((c) => c.id === budget.categoryId)?.name ?? "Categoría específica"}
                  </p>
                )}
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-mh-dark/25 transition-colors hover:text-red-500 disabled:opacity-50"
                title="Eliminar presupuesto"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <p className="font-display text-3xl font-extrabold text-mh-dark">
                  {currency.format(budget.spentAmount)}
                </p>
                <p className="text-sm text-mh-dark/50">
                  de {currency.format(budget.limitAmount)} disponibles
                </p>
              </div>
              <p
                className={`font-display text-2xl font-extrabold ${
                  isOver100 ? "text-red-500" : isOver80 ? "text-amber-500" : "text-mh-green"
                }`}
              >
                {budget.percentageUsed}%
              </p>
            </div>

            <div className="mt-4">
              <ProgressBar
                value={budget.spentAmount}
                max={budget.limitAmount}
                colorClass={isOver100 ? "bg-red-500" : isOver80 ? "bg-amber-400" : "bg-mh-green"}
                heightClass="h-4"
              />
            </div>

            <p className="mt-3 text-xs text-mh-dark/40">
              Restante: {currency.format(Math.max(budget.limitAmount - budget.spentAmount, 0))}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-mh-dark">
                Nuevo presupuesto — {currentMonth}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-mh-dark/40 hover:text-mh-dark">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                  Límite de gasto (L)
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                  Categoría (opcional)
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                >
                  <option value="">Todos los gastos</option>
                  {categories
                    .filter((c) => c.type === "expense" || c.type === "both")
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>
              )}

              <GameButton type="submit" variant="primary" className="mt-2 w-full" disabled={submitting}>
                {submitting ? "Creando..." : "Crear presupuesto"}
              </GameButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
