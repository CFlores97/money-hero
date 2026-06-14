import z from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'El nombre debe tener almenos 2 caracteres'),
        email: z.string().email('Correo invalido'),
        password: z.string().min(8, 'La contraseña debe tener almenos 8 caracteres')
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Correo invalido'),
        password: z.string().min(1, 'La contraseña es obligatoria')
    })
});