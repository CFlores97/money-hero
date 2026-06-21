"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Filter, Plus, Trash2, Wallet } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import GameButton from "@/components/GameButton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import TransactionForm from "@/components/transactions/TransactionForm";
import { emitDataSync, subscribeToDataSync } from "@/lib/data-events";
import { compactCurrencyFormatter, formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/lib/api";
import * as categoriesService from "@/services/categories.service";
import * as transactionsService from "@/services/transactions.service";
import type { Category, CreateTransactionInput, Transaction, TransactionFilters } from "@/types/domain";

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData(nextFilters = filters) {
      setError(null);
      const [transactionsResult, categoriesResult] = await Promise.allSettled([
        transactionsService.getTransactions(nextFilters),
        categoriesService.getCategories(),
      ]);

      if (!isMounted) {
        return;
      }

      if (transactionsResult.status === "fulfilled") {
        setTransactions(transactionsResult.value.data);
        setTotal(transactionsResult.value.total);
      } else {
        setError(
          transactionsResult.reason instanceof Error
            ? transactionsResult.reason.message
            : "No se pudieron cargar las transacciones."
        );
      }

      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value);
      }

      setLoading(false);
    }

    void loadData();
    const unsubscribe = subscribeToDataSync(() => {
      void loadData(filters);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [filters]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const currentPage = Math.floor((filters.offset ?? 0) / PAGE_SIZE) + 1;

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  async function refreshWithFilters(nextFilters = filters) {
    const response = await transactionsService.getTransactions(nextFilters);
    setTransactions(response.data);
    setTotal(response.total);
  }

  async function handleCreate(payload: CreateTransactionInput) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await transactionsService.createTransaction(payload);
      setShowForm(false);
      await refreshWithFilters({
        ...filters,
        offset: 0,
      });
      setFilters((current) => ({
        ...current,
        offset: 0,
      }));
      emitDataSync();
    } catch (submissionError) {
      setFormError(
        submissionError instanceof ApiClientError
          ? submissionError.message
          : "No se pudo registrar la transacción."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await transactionsService.deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      await refreshWithFilters(filters);
      emitDataSync();
    } catch (deletionError) {
      setError(
        deletionError instanceof ApiClientError
          ? deletionError.message
          : "No se pudo eliminar la transacción."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando transacciones..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Transacciones"
          description="Registra tus ingresos y gastos para mantener tu progreso al dia."
          action={
            <GameButton type="button" variant="primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              Nueva transacción
            </GameButton>
          }
        />

        {error ? <ErrorAlert message={error} /> : null}

        <section className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Tipo</span>
              <select
                value={filters.type ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    type: event.target.value ? (event.target.value as "income" | "expense") : undefined,
                    offset: 0,
                  }))
                }
                className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
              >
                <option value="">Todos</option>
                <option value="expense">Gastos</option>
                <option value="income">Ingresos</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Categoría</span>
              <select
                value={filters.categoryId ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    categoryId: event.target.value || undefined,
                    offset: 0,
                  }))
                }
                className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Desde</span>
              <input
                type="date"
                value={filters.from ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    from: event.target.value || undefined,
                    offset: 0,
                  }))
                }
                className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Hasta</span>
              <input
                type="date"
                value={filters.to ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    to: event.target.value || undefined,
                    offset: 0,
                  }))
                }
                className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-mh-dark/55">
            <span className="rounded-full bg-mh-dark/5 px-3 py-1.5">
              <Filter size={14} className="mr-1 inline-block" />
              Filtros activos
            </span>
            <span className="rounded-full bg-mh-dark/5 px-3 py-1.5">
              <Wallet size={14} className="mr-1 inline-block" />
              {total} registro(s)
            </span>
            <span className="rounded-full bg-mh-dark/5 px-3 py-1.5">
              <CalendarRange size={14} className="mr-1 inline-block" />
              Página {currentPage} de {totalPages}
            </span>
          </div>
        </section>

        {transactions.length ? (
          <section className="space-y-3">
            {transactions.map((transaction) => {
              const isExpense = transaction.type === "expense";

              return (
                <article
                  key={transaction.id}
                  className="rounded-[2rem] border-2 border-mh-dark/5 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            isExpense ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {transaction.type}
                        </span>
                        <span className="rounded-full bg-mh-dark/5 px-3 py-1 text-xs font-bold text-mh-dark/60">
                          {categoryMap.get(transaction.categoryId) ?? "Categoría"}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold text-mh-dark">
                        {transaction.description || "Sin descripción"}
                      </p>
                      <p className="mt-1 text-sm text-mh-dark/55">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-display text-3xl font-extrabold ${
                          isExpense ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {compactCurrencyFormatter.format(transaction.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(transaction)}
                        className="mt-3 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={14} className="mr-1 inline-block" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <EmptyState
            title="No hay transacciones para estos filtros"
            description="Prueba limpiando filtros o registra un nuevo ingreso o gasto."
            action={
              <GameButton type="button" variant="gold" onClick={() => setShowForm(true)}>
                Crear primera transacción
              </GameButton>
            }
          />
        )}

        <div className="flex items-center justify-end gap-3">
          <GameButton
            type="button"
            variant="outline"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                offset: Math.max((current.offset ?? 0) - PAGE_SIZE, 0),
              }))
            }
            disabled={(filters.offset ?? 0) === 0}
          >
            Anterior
          </GameButton>
          <GameButton
            type="button"
            variant="outline"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                offset: (current.offset ?? 0) + PAGE_SIZE,
              }))
            }
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </GameButton>
        </div>
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/45 px-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="font-display text-3xl font-extrabold text-mh-dark">Nueva transacción</h2>
            <p className="mt-2 text-sm text-mh-dark/55">
              Después de guardar, se recargarán presupuesto, misiones, logros y notificaciones relacionadas.
            </p>
            <div className="mt-6">
              <TransactionForm
                categories={categories}
                isSubmitting={isSubmitting}
                apiError={formError}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        title="Eliminar transacción"
        description="Esta acción quitará el registro y volverá a sincronizar tu progreso relacionado."
        confirmLabel="Eliminar"
        isOpen={deleteTarget !== null}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </ProtectedPage>
  );
}
