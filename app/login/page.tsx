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
import { loginSchema, type LoginInput } from '@/lib/schemas/login';
import { signInWithEmail } from './actions';

// TODO design: layout/cores/spacing visuais (definir com humano)
// Este componente está com tom adulto da skill produto-dopaminergico mas
// SEM customização visual de marca. Estrutura funcional para teste do fluxo.
export default function LoginPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(input: LoginInput) {
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
              : 'manda teu email. te mando o link.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-sm text-muted-foreground">
              <p>se não chegar em 1 minuto, olha o spam.</p>
              <Button
                variant="link"
                className="mt-2 h-auto p-0"
                onClick={() => {
                  setSent(false);
                  form.reset();
                }}
              >
                mandar pra outro email
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
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'mandando...' : 'mandar link'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
