'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mic, Sparkles, Square, Upload, X } from 'lucide-react';
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
  ALLOWED_AUDIO_MIME,
  MAX_AUDIO_BYTES,
  geracaoMidiaInputSchema,
  intensityLabels,
  intentLabels,
  intentOptions,
  type GeracaoMidiaInput,
} from '@/lib/schemas/geracao';
import { gerarRespostaAudio, type GerarAudioResult } from './actions';
import { Resultado } from './resultado';

const LOADING_MESSAGES = [
  'transcrevendo o áudio dela...',
  'analisando o tom emocional...',
  'puxando teu perfil...',
  'considerando pausas e hesitações...',
  'gerando 3 opções...',
];

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// TODO design: visual do form de áudio
export function GerarAudioForm({
  crushes,
}: {
  crushes: Array<{ id: string; name: string; relationship_type: string }>;
}) {
  const [result, setResult] = useState<GerarAudioResult | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  const form = useForm<GeracaoMidiaInput>({
    resolver: zodResolver(geracaoMidiaInputSchema),
    defaultValues: {
      crush_id: crushes[0]?.id ?? '',
      intensity: 2,
      intent: 'responder_normal',
      extra_context: '',
    },
  });

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(ALLOWED_AUDIO_MIME as readonly string[]).includes(file.type)) {
      toast.error(`formato não suportado (${file.type}).`);
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      toast.error('áudio muito grande (máx 8 MB).');
      return;
    }

    const base64 = await blobToBase64(file);
    setAudioBase64(base64);
    setAudioMime(file.type);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
  }

  function clearAudio() {
    setAudioBase64(null);
    setAudioMime(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('teu navegador não suporta gravação de áudio. faz upload de arquivo.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        stream.getTracks().forEach((t) => t.stop());

        if (blob.size > MAX_AUDIO_BYTES) {
          toast.error('gravação muito longa (máx 8 MB).');
          return;
        }

        const base64 = await blobToBase64(blob);
        setAudioBase64(base64);
        // base-ui pode reportar como "audio/webm;codecs=opus" — normalizar
        const mime = recorder.mimeType.split(';')[0] || 'audio/webm';
        setAudioMime(mime);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (e) {
      console.error('mic permission error:', e);
      toast.error('precisa permitir acesso ao microfone.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function onSubmit(input: GeracaoMidiaInput) {
    if (!audioBase64 || !audioMime) {
      toast.error('escolhe ou grava um áudio primeiro.');
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const r = await gerarRespostaAudio(input, audioBase64, audioMime);
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
            <FormLabel>áudio que ela mandou</FormLabel>
            {!audioUrl ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="hover:bg-accent flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center">
                  <Upload className="text-muted-foreground size-5" />
                  <span className="text-sm">enviar arquivo</span>
                  <span className="text-muted-foreground text-xs">máx 8 MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_AUDIO_MIME.join(',')}
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
                <Button
                  type="button"
                  variant={recording ? 'destructive' : 'outline'}
                  className="flex-1"
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? (
                    <>
                      <Square className="size-4" /> parar gravação
                    </>
                  ) : (
                    <>
                      <Mic className="size-4" /> gravar
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border p-3">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={audioUrl} className="flex-1" />
                <Button type="button" variant="ghost" size="icon-sm" onClick={clearAudio}>
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

          <Button type="submit" disabled={pending || !audioBase64} className="w-full">
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

      {result?.ok && result.data.transcricao_estruturada.recomendar_audio_volta && (
        <Card className="border-foreground/20">
          <CardContent className="py-3 text-sm">
            💡 sugestão: pelo tom dela, talvez valha responder com áudio também.
          </CardContent>
        </Card>
      )}

      {result?.ok && (
        <Resultado data={result.data} crushId={result.crushId} generationId={result.generationId} />
      )}
    </div>
  );
}
