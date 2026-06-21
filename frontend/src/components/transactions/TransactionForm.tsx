"use client";

import { useMemo, useState, type FormEvent } from "react";
import GameButton from "@/components/GameButton";
import ErrorAlert from "@/components/common/ErrorAlert";
import type { Category, CreateTransactionInput } from "@/types/domain";

interface TransactionFormProps {
  categories: Category[];
  isSubmitting?: boolean;
  apiError?: string | null;
  onSubmit: (payload: CreateTransactionInput) => Promise<void> | void;
  onCancel?: () => void;
}

export default function TransactionForm({
  categories,
  isSubmitting = false,
  apiError,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type || category.type === "both"),
    [categories, type]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const numericAmount = Number(amount);

    if (!(type === "income" || type === "expense")) {
      setValidationError("El tipo debe ser income o expense.");
      return;
    }

    if (numericAmount <= 0) {
      setValidationError("El monto debe ser mayor que 0.");
      return;
    }

    if (!categoryId) {
      setValidationError("La categoría es obligatoria.");
      return;
    }

    if (!date) {
      setValidationError("La fecha es obligatoria.");
      return;
    }

    await onSubmit({
      type,
      amount: numericAmount,
      categoryId,
      date,
      description: description.trim() ? description.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategoryId("");
          }}
          className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold ${
            type === "expense"
              ? "border-red-400 bg-red-50 text-red-600"
              : "border-mh-dark/10 bg-white text-mh-dark/55"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategoryId("");
          }}
          className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold ${
            type === "income"
              ? "border-emerald-500 bg-emerald-50 text-emerald-600"
              : "border-mh-dark/10 bg-white text-mh-dark/55"
          }`}
        >
          Ingreso
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Monto</span>
        <input
          aria-label="Monto"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Categoría</span>
        <select
          aria-label="Categoría"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
          required
        >
          <option value="">Selecciona una categoría</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Fecha</span>
        <input
          aria-label="Fecha"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">
          Descripción
        </span>
        <input
          aria-label="Descripción"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
          placeholder="Opcional"
        />
      </label>

      {validationError ? <ErrorAlert message={validationError} /> : null}
      {apiError ? <ErrorAlert message={apiError} /> : null}

      <div className="flex gap-3">
        <GameButton type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar transacción"}
        </GameButton>
        {onCancel ? (
          <GameButton type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </GameButton>
        ) : null}
      </div>
    </form>
  );
}
