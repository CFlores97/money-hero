import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number().positive('El monto debe ser mayor que 0'),
    categoryId: z.string().uuid('Categoria invalida'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD'),
    description: z.string().optional().nullable()
  })
});