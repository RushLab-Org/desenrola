import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('email inválido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
