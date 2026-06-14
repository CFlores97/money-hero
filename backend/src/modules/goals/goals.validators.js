import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre de la meta es obligatorio'),
    targetAmount: z.number().min(1, 'El monto objetivo debe ser mayor que 0'),
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD')
  })
});

export const updateGoalProgressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Id de meta invalido')
  }),
  body: z.object({
    amount: z.number().positive('El aporte debe ser mayor que 0')
  })
});