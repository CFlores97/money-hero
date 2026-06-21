"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, PiggyBank, Plus } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import GameButton from "@/components/GameButton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import ProgressBar from "@/components/ProgressBar";
import { emitDataSync, subscribeToDataSync } from "@/lib/data-events";
import { compactCurrencyFormatter } from "@/lib/formatters";
import { ApiClientError } from "@/lib/api";
import * as budgetsService from "@/services/budgets.service";
import * as categoriesService from "@/services/categories.service";
import type { Budget, Category } from "@/types/domain";

const currentMonth = new Date().toISOString().slice(0, 7);

export default function BudgetsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [limitAmount, setLimitAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setError(null);

      const [budgetResult, categoriesResult] = await Promise.allSettled([
        budgetsService.getCurrentBudget(),
        categoriesService.getCategories("expense"),
      ]);

      if (!isMounted) {
        return;
      }

      if (budgetResult.status === "fulfilled") {
        setBudget(budgetResult.value);
      } else if (budgetResult.reason instanceof ApiClientError && budgetResult.reason.statusCode === 404) {
        setBudget(null);
      } else {
        setError(
          budgetResult.reason instanceof Error
            ? budgetResult.reason.message
            : "No se pudo cargar el presupuesto actual."
        );
      }

      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value);
      }

      setLoading(false);
    }

    void loadPage();
    const unsubscribe = subscribeToDataSync(() => {
      void loadPage();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{4}-\d{2}$/.test(month)) {
      setFormError("El mes debe tener formato YYYY-MM.");
      return;
    }

    if (Number(limitAmount) < 1) {
      setFormError("El límite debe ser al menos 1.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await budgetsService.createBudget({
        month,
        limitAmount: Number(limitAmount),
        categoryId: categoryId || null,
      });

      if (response.month === currentMonth) {
        setBudget(response);
      }

      setShowForm(false);
      emitDataSync();
    } catch (submissionError) {
      setFormError(
        submissionError instanceof ApiClientError
          ? submissionError.message
          : "No se pudo crear el presupuesto."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!budget) {
      return;
    }

    setIsDeleting(true);

    try {
      await budgetsService.deleteBudget(budget.id);
      setBudget(null);
      setShowDeleteDialog(false);
      emitDataSync();
    } catch (deletionError) {
      setError(
        deletionError instanceof ApiClientError
          ? deletionError.message
          : "No se pudo eliminar el presupuesto."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando presupuesto..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Presupuestos"
          description="Administra tu presupuesto mensual real y monitorea alertas de gasto."
          action={
            <GameButton type="button" variant="primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              Crear presupuesto
            </GameButton>
          }
        />

        {error ? <ErrorAlert message={error} /> : null}

        {budget ? (
          <section className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-mh-green/10 p-3 text-mh-green">
                    <PiggyBank size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-extrabold text-mh-dark">
                      Presupuesto de {budget.month}
                    </h2>
                    <p className="text-sm text-mh-dark/55">
                      {budget.categoryId
                        ? categories.find((category) => category.id === budget.categoryId)?.name ?? "Categoría específica"
                        : "Todos los gastos"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-3xl bg-mh-cream px-5 py-4">
                  <p className="text-sm font-semibold text-mh-dark/55">Gastado</p>
                  <p className="font-display text-4xl font-extrabold text-mh-dark">
                    {compactCurrencyFormatter.format(budget.spentAmount)}
                  </p>
                  <p className="mt-1 text-sm text-mh-dark/55">
                    Límite: {compactCurrencyFormatter.format(budget.limitAmount)}
                  </p>
                </div>
              </div>

              <div className="w-full max-w-sm rounded-3xl bg-white/80">
                <div className="rounded-3xl border border-mh-dark/8 bg-mh-dark px-5 py-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/60">Uso actual</p>
                  <p className="mt-1 font-display text-4xl font-extrabold">{budget.percentageUsed}%</p>
                  <div className="mt-4">
                    <ProgressBar
                      value={budget.spentAmount}
                      max={budget.limitAmount}
                      colorClass={budget.percentageUsed >= 100 ? "bg-red-500" : "bg-mh-gold"}
                      trackClass="bg-white/15"
                      heightClass="h-4"
                    />
                  </div>
                </div>

                {budget.alertTriggered || budget.percentageUsed >= 80 ? (
                  <div className="mt-4 rounded-3xl bg-amber-50 px-5 py-4 text-amber-700">
                    <p className="font-semibold">
                      <AlertTriangle size={18} className="mr-2 inline-block" />
                      Alerta activa
                    </p>
                    <p className="mt-2 text-sm">
                      Ya se alcanzó el umbral de alerta del presupuesto para este mes.
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex gap-3">
                  <GameButton type="button" variant="outline" className="flex-1" onClick={() => setShowForm(true)}>
                    Crear otro presupuesto
                  </GameButton>
                  <GameButton type="button" variant="gold" className="flex-1" onClick={() => setShowDeleteDialog(true)}>
                    Eliminar actual
                  </GameButton>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <EmptyState
            title="No existe presupuesto para el mes actual"
            description="Puedes crear uno ahora mismo y comenzar a recibir alertas reales."
            action={
              <GameButton type="button" variant="gold" onClick={() => setShowForm(true)}>
                Crear presupuesto
              </GameButton>
            }
          />
        )}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/45 px-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="font-display text-3xl font-extrabold text-mh-dark">Nuevo presupuesto mensual</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">Mes</span>
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                  Límite mensual
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={limitAmount}
                  onChange={(event) => setLimitAmount(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                  Categoría opcional
                </span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                >
                  <option value="">Todos los gastos</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {formError ? <ErrorAlert message={formError} /> : null}

              <div className="flex gap-3">
                <GameButton type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Guardar presupuesto"}
                </GameButton>
                <GameButton type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  Cancelar
                </GameButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        title="Eliminar presupuesto actual"
        description="Esta acción quitará el presupuesto visible para el mes actual."
        confirmLabel="Eliminar"
        isOpen={showDeleteDialog}
        isLoading={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => void handleDelete()}
      />
    </ProtectedPage>
  );
}
