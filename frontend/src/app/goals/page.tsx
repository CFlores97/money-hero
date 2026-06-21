"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Target } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import GameButton from "@/components/GameButton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import ProgressBar from "@/components/ProgressBar";
import { emitDataSync, subscribeToDataSync } from "@/lib/data-events";
import { compactCurrencyFormatter, formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/lib/api";
import * as goalsService from "@/services/goals.service";
import type { Goal } from "@/types/domain";

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProgressId, setShowProgressId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progressAmount, setProgressAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadGoals() {
      try {
        const response = await goalsService.getGoals();
        if (isMounted) {
          setGoals(response);
          setError(null);
          setLoading(false);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las metas.");
          setLoading(false);
        }
      }
    }

    void loadGoals();
    const unsubscribe = subscribeToDataSync(() => {
      void loadGoals();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    if (Number(targetAmount) < 1) {
      setFormError("El monto objetivo debe ser al menos 1.");
      return;
    }

    if (!deadline) {
      setFormError("La fecha límite es obligatoria.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const goal = await goalsService.createGoal({
        name: name.trim(),
        targetAmount: Number(targetAmount),
        deadline,
      });

      setGoals((current) => [goal, ...current]);
      setShowCreateForm(false);
      setName("");
      setTargetAmount("");
      setDeadline("");
      emitDataSync();
    } catch (submissionError) {
      setFormError(
        submissionError instanceof ApiClientError ? submissionError.message : "No se pudo crear la meta."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleProgress(goalId: string) {
    if (Number(progressAmount) <= 0) {
      setFormError("El aporte debe ser mayor que 0.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const updatedGoal = await goalsService.updateGoalProgress(goalId, Number(progressAmount));
      setGoals((current) => current.map((goal) => (goal.id === goalId ? updatedGoal : goal)));
      setShowProgressId(null);
      setProgressAmount("");
      emitDataSync();
    } catch (submissionError) {
      setFormError(
        submissionError instanceof ApiClientError
          ? submissionError.message
          : "No se pudo registrar el avance."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsSubmitting(true);

    try {
      await goalsService.deleteGoal(deleteTarget.id);
      setGoals((current) => current.filter((goal) => goal.id !== deleteTarget.id));
      setDeleteTarget(null);
      emitDataSync();
    } catch (deletionError) {
      setError(
        deletionError instanceof ApiClientError
          ? deletionError.message
          : "No se pudo eliminar la meta."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando metas..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Metas"
          description="Crea objetivos reales, registra aportes y sigue el progreso con la barra gamificada."
          action={
            <GameButton type="button" variant="primary" onClick={() => setShowCreateForm(true)}>
              <Plus size={18} />
              Nueva meta
            </GameButton>
          }
        />

        {error ? <ErrorAlert message={error} /> : null}

        {goals.length ? (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {goals.map((goal) => (
              <article
                key={goal.id}
                className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-mh-lime/20 p-3 text-mh-green">
                        <Target size={22} />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-extrabold text-mh-dark">{goal.name}</h2>
                        <p className="text-sm text-mh-dark/55">Vence el {formatDate(goal.deadline)}</p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      goal.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : goal.status === "failed"
                          ? "bg-red-100 text-red-600"
                          : "bg-mh-dark/6 text-mh-dark/60"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div className="mt-5 rounded-3xl bg-mh-cream px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-mh-dark/55">Acumulado</p>
                      <p className="font-display text-3xl font-extrabold text-mh-dark">
                        {compactCurrencyFormatter.format(goal.currentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-mh-dark/55">Objetivo</p>
                      <p className="font-display text-2xl font-extrabold text-mh-dark">
                        {compactCurrencyFormatter.format(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar value={goal.currentAmount} max={goal.targetAmount} colorClass="bg-mh-green" heightClass="h-4" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-mh-dark/55">{goal.percentageCompleted}% completado</p>
                </div>

                {goal.status === "active" ? (
                  <div className="mt-5 space-y-3">
                    {showProgressId === goal.id ? (
                      <div className="rounded-3xl border border-mh-dark/8 bg-white p-4">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                            Aporte
                          </span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={progressAmount}
                            onChange={(event) => setProgressAmount(event.target.value)}
                            className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                          />
                        </label>
                        {formError ? <div className="mt-3"><ErrorAlert message={formError} /></div> : null}
                        <div className="mt-4 flex gap-3">
                          <GameButton type="button" variant="primary" className="flex-1" onClick={() => void handleProgress(goal.id)} disabled={isSubmitting}>
                            Guardar avance
                          </GameButton>
                          <GameButton type="button" variant="outline" className="flex-1" onClick={() => setShowProgressId(null)}>
                            Cancelar
                          </GameButton>
                        </div>
                      </div>
                    ) : (
                      <GameButton type="button" variant="outline" className="w-full" onClick={() => setShowProgressId(goal.id)}>
                        Agregar avance
                      </GameButton>
                    )}
                  </div>
                ) : null}

                <div className="mt-4">
                  <GameButton type="button" variant="gold" className="w-full" onClick={() => setDeleteTarget(goal)}>
                    Eliminar meta
                  </GameButton>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No tienes metas registradas"
            description="Crea una meta y empieza a seguirla con progreso real."
            action={
              <GameButton type="button" variant="gold" onClick={() => setShowCreateForm(true)}>
                Crear meta
              </GameButton>
            }
          />
        )}
      </div>

      {showCreateForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/45 px-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="font-display text-3xl font-extrabold text-mh-dark">Nueva meta</h2>
            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">Nombre</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">Monto objetivo</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={targetAmount}
                  onChange={(event) => setTargetAmount(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">Fecha límite</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>

              {formError ? <ErrorAlert message={formError} /> : null}

              <div className="flex gap-3">
                <GameButton type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar meta"}
                </GameButton>
                <GameButton type="button" variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </GameButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        title="Eliminar meta"
        description="Esta acción borra la meta y su progreso actual."
        confirmLabel="Eliminar"
        isOpen={deleteTarget !== null}
        isLoading={isSubmitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </ProtectedPage>
  );
}
