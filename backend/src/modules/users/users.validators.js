import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
      avatar: z.string().optional().nullable()
    })
    .refine((data) => data.name !== undefined || data.avatar !== undefined, {
      message: 'Debe enviar al menos un campo para actualizar'
    })
});
