'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { Sparkles, Upload, X } from 'lucide-react';
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
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  geracaoMidiaInputSchema,
  intensityLabels,
  intentLabels,
  intentOptions,
  type GeracaoMidiaInput,
} from '@/lib/schemas/geracao';
import { gerarRespostaPrint, type GerarPrintResult } from './actions';
import { Resultado } from './resultado';

const LOADING_MESSAGES = [
  'lendo o print da conversa...',
  'identificando quem disse o quê...',
  'puxando teu perfil...',
  'analisando o tom dela...',
  'gerando 3 opções...',
];

// TODO design: visual do form de print
export function GerarPrintForm({
  crushes,
}: {
  crushes: Array<{ id: string; name: string; relationship_type: string }>;
}) {
  const [result, setResult] = useState<GerarPrintResult | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const form = useForm<GeracaoMidiaInput>({
    resolver: zodResolver(geracaoMidiaInputSchema),
    defaultValues: {
      crush_id: crushes[0]?.id ?? '',
      intensity: 2,
      intent: 'responder_normal',
      extra_context: '',
    },
  });

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type)) {
      toast.error(`formato não suportado (${file.type}). use JPG, PNG ou WebP.`);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('imagem muito grande (máx 5 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] ?? '';
      setImageBase64(base64);
      setImageMime(file.type);
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageBase64(null);
    setImageMime(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onSubmit(input: GeracaoMidiaInput) {
    if (!imageBase64 || !imageMime) {
      toast.error('escolhe um print primeiro.');
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const r = await gerarRespostaPrint(input, imageBase64, imageMime);
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

          <FormItem>
            <FormLabel>print da conversa</FormLabel>
            {!previewUrl ? (
              <label className="hover:bg-accent flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center">
                <Upload className="text-muted-foreground size-6" />
                <span className="text-sm">clica pra escolher imagem (JPG, PNG, WebP)</span>
                <span className="text-muted-foreground text-xs">máx 5 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_MIME.join(',')}
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block">
                <Image
                  src={previewUrl}
                  alt="preview do print"
                  width={300}
                  height={400}
                  className="max-h-80 w-auto rounded-md border"
                  unoptimized
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearImage}
                  className="absolute top-1 right-1 bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </FormItem>

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
                    placeholder="algo específico dessa situação..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={pending || !imageBase64} className="w-full">
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
