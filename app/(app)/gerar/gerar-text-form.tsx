'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  geracaoInputSchema,
  intensityLabels,
  intentLabels,
  intentOptions,
  type GeracaoInput,
} from '@/lib/schemas/geracao';
import { gerarResposta, type GerarResult } from './actions';
import { Resultado } from './resultado';

const LOADING_MESSAGES = [
  'lendo o que ela mandou...',
  'puxando teu perfil...',
  'analisando o tom...',
  'aplicando provocação invertida...',
  'calibrando pela tua voz...',
  'verificando double meaning...',
  'gerando 3 opções...',
];

// TODO design: visual do form (definir com humano via Claude Design)
export function GerarTextForm({
  crushes,
}: {
  crushes: Array<{ id: string; name: string; relationship_type: string }>;
}) {
  const [result, setResult] = useState<GerarResult | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);

  // Loading dopaminérgico: troca mensagem a cada ~900ms enquanto a IA processa
  useEffect(() => {
    if (!pending) {
      setLoadingIdx(0);
      return;
    }
    const i = setInterval(() => {
      setLoadingIdx((idx) => (idx + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(i);
  }, [pending]);

  const form = useForm<GeracaoInput>({
    resolver: zodResolver(geracaoInputSchema),
    defaultValues: {
      crush_id: crushes[0]?.id ?? '',
      her_message: '',
      intensity: 2,
      intent: 'responder_normal',
      extra_context: '',
    },
  });

  async function onSubmit(input: GeracaoInput) {
    setPending(true);
    setResult(null);
    try {
      const r = await gerarResposta(input);
      setResult(r);
      if (!r.ok) toast.error(r.error);
    } catch {
      toast.error('algo travou. tenta de novo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="crush_id"
            render={({ field }) => {
              const selectedName = crushes.find((c) => c.id === field.value)?.name;
              return (
                <FormItem>
                  <FormLabel>pra quem</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>{selectedName ?? 'escolhe...'}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crushes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="her_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>mensagem dela</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="cola exatamente o que ela mandou..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>intensidade</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    {intensityLabels[field.value as 1 | 2 | 3 | 4 | 5]}
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(v) => {
                      const val = Array.isArray(v) ? v[0] : v;
                      if (typeof val === 'number') field.onChange(val);
                    }}
                    className="py-2"
                  />
                </FormControl>
                <div className="text-muted-foreground flex justify-between text-[10px]">
                  <span>leve</span>
                  <span>equilibrado</span>
                  <span>quente</span>
                  <span>provocante</span>
                  <span>explícito</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>intenção</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {intentOptions.map((opt) => {
                    const active = field.value === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => field.onChange(opt)}
                        className={
                          'rounded-full border px-3 py-1 text-sm transition-colors ' +
                          (active
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground/30')
                        }
                      >
                        {intentLabels[opt]}
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extra_context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>contexto extra (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="algo específico dessa situação que ajuda a calibrar..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={pending} className="w-full">
            <Sparkles className="size-4" />
            {pending ? 'gerando...' : 'gerar 3 opções'}
          </Button>
        </form>
      </Form>

      {pending && (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            {LOADING_MESSAGES[loadingIdx]}
          </CardContent>
        </Card>
      )}

      {result?.ok && (
        <Resultado data={result.data} crushId={result.crushId} generationId={result.generationId} />
      )}
    </div>
  );
}
