import { z } from 'zod';

// Login por magic link (só email) — usado no 1º acesso pós-compra e no "esqueci a senha".
export const loginSchema = z.object({
  email: z.email('email inválido'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Login por email + senha — usado depois que o usuário define uma senha em /configuracoes.
export const passwordLoginSchema = z.object({
  email: z.email('email inválido'),
  password: z.string().min(1, 'digita tua senha'),
});

export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;

// Definir/alterar senha (em /configuracoes, com sessão já autenticada).
export const setPasswordSchema = z.object({
  password: z.string().min(8, 'mínimo 8 caracteres'),
});

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
