"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Target, Trash2, X } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import GameButton from "@/components/GameButton";
import { ApiError, createGoal, deleteGoal, getGoals, updateGoalProgress, type Goal } from "@/lib/api";
import { getToken } from "@/lib/session";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
});

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [addingFundsId, setAddingFundsId] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");
  const [fundsError, setFundsError] = useState<string | null>(null);
  const [fundsLoading, setFundsLoading] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
    if (!storedToken) return;

    getGoals(storedToken)
      .then(setGoals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setFormLoading(true);

    try {
      const goal = await createGoal(token, {
        name,
        targetAmount: Number(targetAmount),
        deadline,
      });

      setGoals((prev) => [goal, ...prev]);
      setName("");
      setTargetAmount("");
      setDeadline("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la meta.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!token) return;
    try {
      await deleteGoal(token, id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo eliminar la meta.");
    }
  }

  async function handleAddFunds(event: FormEvent<HTMLFormElement>, goal: Goal) {
    event.preventDefault();
    if (!token) return;

    setFundsError(null);
    setFundsLoading(true);

    try {
      const updated = await updateGoalProgress(token, goal.id, Number(fundsAmount));
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
      setFundsAmount("");
      setAddingFundsId(null);
    } catch (err) {
      setFundsError(err instanceof ApiError ? err.message : "No se pudo registrar el ahorro.");
    } finally {
      setFundsLoading(false);
    }
  }

  const statusLabel: Record<Goal["status"], string> = {
    active: "",
    completed: "¡Completada!",
    failed: "Vencida",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <Target className="text-mh-green" /> Metas de ahorro
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Cada meta es una quest a largo plazo. Avanza poco a poco hasta completarla.
        </p>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-mh-dark/40">Cargando metas...</p>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex flex-col rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex rounded-2xl bg-mh-green/10 p-3 text-mh-green">
                  <Target size={24} />
                </div>
                <div className="flex items-center gap-2">
                  {goal.status !== "active" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        goal.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {statusLabel[goal.status]}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-mh-dark/25 transition-colors hover:text-red-500"
                    title="Eliminar meta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-mh-dark">{goal.name}</h3>
              <p className="mt-1 text-sm text-mh-dark/60">
                {currency.format(goal.currentAmount)} de {currency.format(goal.targetAmount)}
              </p>
              <p className="text-xs text-mh-dark/40">Fecha límite: {goal.deadline}</p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-mh-dark/50">
                  <span>Progreso</span>
                  <span>{goal.percentageCompleted}%</span>
                </div>
                <ProgressBar
                  value={goal.currentAmount}
                  max={goal.targetAmount}
                  colorClass={goal.status === "completed" ? "bg-emerald-500" : "bg-mh-green"}
                  heightClass="h-3.5"
                />
              </div>

              {goal.status === "active" && (
                addingFundsId === goal.id ? (
                  <form onSubmit={(e) => handleAddFunds(e, goal)} className="mt-4 flex flex-col gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={fundsAmount}
                      onChange={(e) => setFundsAmount(e.target.value)}
                      placeholder="Monto en L"
                      className="rounded-xl border-2 border-mh-dark/10 px-3 py-2 text-sm outline-none focus:border-mh-green"
                      required
                      autoFocus
                    />
                    {fundsError && (
                      <p className="text-xs font-semibold text-red-600">{fundsError}</p>
                    )}
                    <div className="flex gap-2">
                      <GameButton type="submit" variant="primary" className="flex-1" disabled={fundsLoading}>
                        {fundsLoading ? "..." : "Confirmar"}
                      </GameButton>
                      <GameButton
                        type="button"
                        variant="outline"
                        onClick={() => { setAddingFundsId(null); setFundsError(null); }}
                      >
                        Cancelar
                      </GameButton>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4">
                    <GameButton
                      variant="primary"
                      className="w-full"
                      onClick={() => setAddingFundsId(goal.id)}
                    >
                      Agregar ahorro
                    </GameButton>
                  </div>
                )
              )}
            </div>
          ))}

          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-mh-dark/15 bg-transparent p-5 text-center">
            <p className="font-display text-lg font-bold text-mh-dark">¿Una nueva aventura?</p>
            <p className="mt-1 text-sm text-mh-dark/60">Crea una nueva meta de ahorro.</p>
            <div className="mt-4">
              <GameButton variant="outline" onClick={() => setShowForm(true)}>
                + Nueva meta
              </GameButton>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-mh-dark">Nueva meta de ahorro</h2>
              <button onClick={() => setShowForm(false)} className="text-mh-dark/40 hover:text-mh-dark">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Nombre</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                  minLength={2}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Monto objetivo (L)</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Fecha límite</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>
              )}

              <GameButton type="submit" variant="primary" className="mt-2 w-full" disabled={formLoading}>
                {formLoading ? "Creando..." : "Crear meta"}
              </GameButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
