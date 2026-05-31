'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signInWithEmail, signInWithPassword } from './actions';

// Um único form (email + senha). O modo só controla se o campo de senha aparece
// e qual ação roda no submit. Auth: ADR-029. Visual: Onyx & Brasa (ADR-033).
const loginFormSchema = z.object({
  email: z.email('email inválido'),
  password: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [sent, setSent] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    if (mode === 'magic') {
      const result = await signInWithEmail({ email: values.email });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSent(true);
      return;
    }

    if (!values.password) {
      form.setError('password', { message: 'digita tua senha' });
      return;
    }

    const result = await signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    window.location.assign('/');
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="w-full max-w-sm -translate-y-8">
        {/* Logo + glow radial brasa */}
        <div className="relative mb-9 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-44 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(160,24,42,0.5)_0%,rgba(160,24,42,0)_70%)] blur-2xl"
          />
          <h1 className="font-serif text-[2.7rem] leading-none font-medium tracking-tight">
            Sacada
          </h1>
          <p className="text-primary mt-3 text-[11px] font-medium tracking-[0.25em] uppercase">
            inteligência de conversa
          </p>
        </div>

        {sent ? (
          <div className="text-muted-foreground text-center text-sm">
            <p>olha tua caixa de entrada. o link tá lá.</p>
            <p className="mt-1 text-xs">se não chegar em 1 minuto, olha o spam.</p>
            <Button
              variant="link"
              className="mt-3 h-auto p-0"
              onClick={() => {
                setSent(false);
                form.reset();
              }}
            >
              voltar
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-[11px] tracking-wider uppercase">
                      email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="você@exemplo.com"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === 'password' && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-[11px] tracking-wider uppercase">
                        senha
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="tua senha"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-full shadow-[0_4px_24px_-2px_rgba(160,24,42,0.6)]"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? mode === 'password'
                    ? 'entrando...'
                    : 'mandando...'
                  : mode === 'password'
                    ? 'entrar'
                    : 'mandar link'}
              </Button>
            </form>
          </Form>
        )}

        {!sent && (
          <div className="mt-6 text-center text-sm">
            {mode === 'password' ? (
              <>
                <p className="text-muted-foreground">primeira vez ou esqueceu a senha?</p>
                <Button
                  variant="link"
                  className="text-primary h-auto p-0 font-medium"
                  onClick={() => {
                    setMode('magic');
                    form.clearErrors();
                  }}
                >
                  entra com link no email
                </Button>
              </>
            ) : (
              <Button
                variant="link"
                className="text-primary h-auto p-0 font-medium"
                onClick={() => {
                  setMode('password');
                  form.clearErrors();
                }}
              >
                já tenho senha — entrar com email e senha
              </Button>
            )}
          </div>
        )}

        <p className="text-muted-foreground mt-10 text-center text-[10px] tracking-[0.2em] uppercase">
          conversas adultas · uso individual
        </p>
      </div>
    </main>
  );
}
