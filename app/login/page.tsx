'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  loginSchema,
  passwordLoginSchema,
  type LoginInput,
  type PasswordLoginInput,
} from '@/lib/schemas/login';
import { signInWithEmail, signInWithPassword } from './actions';

// TODO design: layout/cores/spacing visuais (definir com humano)
// Auth: senha por padrão; magic link como 1º acesso pós-compra / "esqueci a senha" (ADR-029).
export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [sent, setSent] = useState(false);

  const passwordForm = useForm<PasswordLoginInput>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const magicForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  async function onPasswordSubmit(input: PasswordLoginInput) {
    const result = await signInWithPassword(input);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    // sessão setada via cookie no server action; reload garante o middleware ver
    window.location.assign('/');
  }

  async function onMagicSubmit(input: LoginInput) {
    const result = await signInWithEmail(input);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSent(true);
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
                  magicForm.reset();
                }}
              >
                voltar
              </Button>
            </div>
          ) : mode === 'password' ? (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
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
                <FormField
                  control={passwordForm.control}
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? 'entrando...' : 'entrar'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...magicForm}>
              <form onSubmit={magicForm.handleSubmit(onMagicSubmit)} className="space-y-4">
                <FormField
                  control={magicForm.control}
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={magicForm.formState.isSubmitting}
                >
                  {magicForm.formState.isSubmitting ? 'mandando...' : 'mandar link'}
                </Button>
              </form>
            </Form>
          )}

          {!sent && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                className="text-muted-foreground h-auto p-0 text-xs"
                onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
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
