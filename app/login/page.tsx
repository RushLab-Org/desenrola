'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
// e qual ação roda no submit — evita o bug de trocar de FormProvider na mesma
// posição (que quebrava o onChange do input). Auth: ADR-029.
const loginFormSchema = z.object({
  email: z.email('email inválido'),
  password: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// TODO design: layout/cores/spacing visuais (definir com humano)
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
    // sessão setada via cookie no server action; reload garante o middleware ver
    window.location.assign('/');
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sacada IA</CardTitle>
          <CardDescription>
            {sent
              ? 'olha tua caixa de entrada. o link tá lá.'
              : mode === 'password'
                ? 'entra com teu email e senha.'
                : 'manda teu email. te mando o link pra entrar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-muted-foreground text-sm">
              <p>se não chegar em 1 minuto, olha o spam.</p>
              <Button
                variant="link"
                className="mt-2 h-auto p-0"
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
                      <FormLabel>email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="voce@exemplo.com"
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
                        <FormLabel>senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="tua senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
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
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground h-auto p-0 text-xs"
                onClick={() => {
                  setMode(mode === 'password' ? 'magic' : 'password');
                  form.clearErrors();
                }}
              >
                {mode === 'password'
                  ? 'primeira vez ou esqueceu a senha? entra com link'
                  : 'já tenho senha — entrar com email e senha'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
