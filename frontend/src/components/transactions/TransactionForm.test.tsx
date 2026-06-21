import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TransactionForm from "@/components/transactions/TransactionForm";
import type { Category } from "@/types/domain";

const categories: Category[] = [
  { id: "c1", name: "Comida", type: "expense", icon: null },
  { id: "c2", name: "Salario", type: "income", icon: null },
];

describe("TransactionForm", () => {
  it("valida amount", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TransactionForm categories={categories} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Monto"), "0");
    await user.selectOptions(screen.getByLabelText("Categoría"), "c1");
    await user.click(screen.getByRole("button", { name: /guardar transacción/i }));

    expect(await screen.findByText("El monto debe ser mayor que 0.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía payload correcto", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TransactionForm categories={categories} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Ingreso" }));
    await user.type(screen.getByLabelText("Monto"), "125.5");
    await user.selectOptions(screen.getByLabelText("Categoría"), "c2");
    await user.clear(screen.getByLabelText("Fecha"));
    await user.type(screen.getByLabelText("Fecha"), "2026-06-21");
    await user.type(screen.getByLabelText("Descripción"), "Pago freelance");
    await user.click(screen.getByRole("button", { name: /guardar transacción/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      type: "income",
      amount: 125.5,
      categoryId: "c2",
      date: "2026-06-21",
      description: "Pago freelance",
    });
  });

  it("muestra error backend", () => {
    render(<TransactionForm categories={categories} onSubmit={vi.fn()} apiError="Error backend" />);

    expect(screen.getByText("Error backend")).toBeInTheDocument();
  });
});
