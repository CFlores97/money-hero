import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Mes debe tener formato YYYY-MM'),
    limitAmount: z.number().min(1, 'El limite debe ser al menos 1'),
    categoryId: z.string().uuid().optional().nullable()
  })
});