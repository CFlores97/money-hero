"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Target, X } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import GameButton from "@/components/GameButton";
import { goals as demoGoals } from "@/lib/demoData";
import { ApiError, createGoal, updateGoalProgress } from "@/lib/api";
import { getToken } from "@/lib/session";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
});

interface DisplayGoal {
  id: string | number;
  realId?: string;
  title: string;
  current: number;
  target: number;
  icon: typeof Target;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<DisplayGoal[]>(demoGoals);
  const [token, setToken] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [addingFundsId, setAddingFundsId] = useState<string | number | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");
  const [fundsError, setFundsError] = useState<string | null>(null);
  const [fundsLoading, setFundsLoading] = useState(false);

  useEffect(() => {
    // Token lives in localStorage, only readable client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());
  }, []);

  async function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setLoading(true);

    try {
      const goal = await createGoal(token, {
        name,
        targetAmount: Number(targetAmount),
        deadline,
      });

      setGoals((prev) => [
        ...prev,
        {
          id: goal.id,
          realId: goal.id,
          title: goal.name,
          current: goal.currentAmount,
          target: goal.targetAmount,
          icon: Target,
        },
      ]);

      setName("");
      setTargetAmount("");
      setDeadline("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la meta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFunds(event: FormEvent<HTMLFormElement>, goal: DisplayGoal) {
    event.preventDefault();
    if (!token || !goal.realId) return;

    setFundsError(null);
    setFundsLoading(true);

    try {
      const updated = await updateGoalProgress(token, goal.realId, Number(fundsAmount));

      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, current: updated.currentAmount } : g))
      );

      setFundsAmount("");
      setAddingFundsId(null);
    } catch (err) {
      setFundsError(err instanceof ApiError ? err.message : "No se pudo registrar el ahorro.");
    } finally {
      setFundsLoading(false);
    }
  }

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          return (
            <div key={goal.id} className="flex flex-col rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
              <div className="mb-3 inline-flex w-fit rounded-2xl bg-mh-green/10 p-3 text-mh-green">
                <goal.icon size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-mh-dark">{goal.title}</h3>
              <p className="mt-1 text-sm text-mh-dark/60">
                {currency.format(goal.current)} de {currency.format(goal.target)}
              </p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-mh-dark/50">
                  <span>Progreso</span>
                  <span>{pct}%</span>
                </div>
                <ProgressBar value={goal.current} max={goal.target} colorClass="bg-mh-green" heightClass="h-3.5" />
              </div>

              {addingFundsId === goal.id ? (
                <form onSubmit={(event) => handleAddFunds(event, goal)} className="mt-4 flex flex-col gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={fundsAmount}
                    onChange={(event) => setFundsAmount(event.target.value)}
                    placeholder="Monto en L"
                    className="rounded-xl border-2 border-mh-dark/10 px-3 py-2 text-sm outline-none focus:border-mh-green"
                    required
                    autoFocus
                  />
                  {fundsError && <p className="text-xs font-semibold text-red-600">{fundsError}</p>}
                  <div className="flex gap-2">
                    <GameButton type="submit" variant="primary" className="flex-1" disabled={fundsLoading}>
                      {fundsLoading ? "..." : "Confirmar"}
                    </GameButton>
                    <GameButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAddingFundsId(null);
                        setFundsError(null);
                      }}
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
                    disabled={!goal.realId}
                    onClick={() => goal.realId && setAddingFundsId(goal.id)}
                  >
                    Agregar ahorro
                  </GameButton>
                  {!goal.realId && (
                    <p className="mt-1 text-center text-xs text-mh-dark/40">Meta de ejemplo</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

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
                  onChange={(event) => setName(event.target.value)}
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
                  onChange={(event) => setTargetAmount(event.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">Fecha límite</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="rounded-xl border-2 border-mh-dark/10 px-4 py-2.5 text-sm outline-none focus:border-mh-green"
                  required
                />
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>
              )}

              <GameButton type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
                {loading ? "Creando..." : "Crear meta"}
              </GameButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
