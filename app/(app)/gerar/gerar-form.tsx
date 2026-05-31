'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { Image as ImageIcon, Mic, Sparkles, Square, Upload, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
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
  ALLOWED_IMAGE_MIME,
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
  intensityLabels,
  intentLabels,
  intentOptions,
  type GeracaoOutput,
} from '@/lib/schemas/geracao';
import { gerarResposta, gerarRespostaAudio, gerarRespostaPrint } from './actions';
import { Resultado } from './resultado';

// Mensagens de loading contextuais por modalidade (skill produto-dopaminergico
// 1.1: feedback contextual, nunca genérico).
const LOADING_TEXT = [
  'lendo o que ela mandou...',
  'puxando teu perfil...',
  'analisando o tom...',
  'aplicando provocação invertida...',
  'calibrando pela tua voz...',
  'verificando double meaning...',
  'gerando 3 opções...',
];
const LOADING_PRINT = [
  'lendo o print da conversa...',
  'identificando quem disse o quê...',
  'puxando teu perfil...',
  'analisando o tom dela...',
  'gerando 3 opções...',
];
const LOADING_AUDIO = [
  'transcrevendo o áudio dela...',
  'analisando o tom emocional...',
  'puxando teu perfil...',
  'considerando pausas e hesitações...',
  'gerando 3 opções...',
];

// Schema do form na UI: her_message é OPCIONAL porque print/áudio substituem o
// texto. A regra "pelo menos uma entrada" é validada no submit. As Server
// Actions revalidam com os schemas estritos (defesa em profundidade).
const gerarFormSchema = z.object({
  crush_id: z.string().uuid('escolhe pra quem é'),
  her_message: z.string().max(5000, 'mensagem muito longa'),
  intensity: z.number().int().min(1).max(5),
  intent: z.enum(intentOptions),
  extra_context: z.string().max(2000, 'contexto muito longo'),
});

type GerarFormValues = z.infer<typeof gerarFormSchema>;

type NormalizedResult = {
  data: GeracaoOutput;
  crushId: string;
  generationId: string;
  audioVolta: boolean;
};

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

// TODO design: visual do form (definir com humano via Claude Design)
export function GerarForm({
  crushes,
}: {
  crushes: Array<{ id: string; name: string; relationship_type: string }>;
}) {
  const [result, setResult] = useState<NormalizedResult | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState<string[]>(LOADING_TEXT);

  // Mídia anexada — só uma modalidade por geração (print OU áudio).
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Loading dopaminérgico: troca a mensagem a cada ~900ms enquanto processa.
  useEffect(() => {
    if (!pending) {
      setLoadingIdx(0);
      return;
    }
    const i = setInterval(() => {
      setLoadingIdx((idx) => (idx + 1) % loadingMessages.length);
    }, 900);
    return () => clearInterval(i);
  }, [pending, loadingMessages]);

  // Cleanup do object URL e do recorder ao desmontar.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  const form = useForm<GerarFormValues>({
    resolver: zodResolver(gerarFormSchema),
    defaultValues: {
      crush_id: crushes[0]?.id ?? '',
      her_message: '',
      intensity: 2,
      intent: 'responder_normal',
      extra_context: '',
    },
  });

  function clearImage() {
    setImageBase64(null);
    setImageMime(null);
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  function clearAudio() {
    setAudioBase64(null);
    setAudioMime(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
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

    clearAudio(); // só uma modalidade por vez
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageBase64(dataUrl.split(',')[1] ?? '');
      setImageMime(file.type);
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function onAudioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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

    clearImage();
    setAudioBase64(await blobToBase64(file));
    setAudioMime(file.type);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('teu navegador não suporta gravação. faz upload do arquivo.');
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

        clearImage();
        setAudioBase64(await blobToBase64(blob));
        // recorder pode reportar "audio/webm;codecs=opus" — normalizar
        setAudioMime(recorder.mimeType.split(';')[0] || 'audio/webm');
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

  async function onSubmit(values: GerarFormValues) {
    const hasImage = !!imageBase64 && !!imageMime;
    const hasAudio = !!audioBase64 && !!audioMime;
    const hasText = values.her_message.trim().length > 0;

    if (!hasImage && !hasAudio && !hasText) {
      toast.error('cola a mensagem dela, anexa um print ou manda um áudio.');
      return;
    }

    const midia = {
      crush_id: values.crush_id,
      intensity: values.intensity,
      intent: values.intent,
      extra_context: values.extra_context,
    };

    setPending(true);
    setResult(null);
    try {
      if (hasImage) {
        setLoadingMessages(LOADING_PRINT);
        const r = await gerarRespostaPrint(midia, imageBase64!, imageMime!);
        if (r.ok) {
          setResult({
            data: r.data,
            crushId: r.crushId,
            generationId: r.generationId,
            audioVolta: false,
          });
        } else toast.error(r.error);
      } else if (hasAudio) {
        setLoadingMessages(LOADING_AUDIO);
        const r = await gerarRespostaAudio(midia, audioBase64!, audioMime!);
        if (r.ok) {
          setResult({
            data: r.data,
            crushId: r.crushId,
            generationId: r.generationId,
            audioVolta: r.data.transcricao_estruturada.recomendar_audio_volta ?? false,
          });
        } else toast.error(r.error);
      } else {
        setLoadingMessages(LOADING_TEXT);
        const r = await gerarResposta({ ...midia, her_message: values.her_message });
        if (r.ok) {
          setResult({
            data: r.data,
            crushId: r.crushId,
            generationId: r.generationId,
            audioVolta: false,
          });
        } else toast.error(r.error);
      }
    } catch {
      toast.error('algo travou. tenta de novo.');
    } finally {
      setPending(false);
    }
  }

  const hasMedia = !!previewUrl || !!audioUrl;

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

          {/* Bloco único: texto OU print OU áudio. */}
          <div className="space-y-3 rounded-md border p-3">
            <FormField
              control={form.control}
              name="her_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>a mensagem dela</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="cola exatamente o que ela mandou..."
                      disabled={hasMedia}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anexos — usa Label puro (NUNCA FormLabel fora de FormField). */}
            {!hasMedia && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  ou manda o print da conversa / um áudio que ela mandou
                </p>
                <div className="flex flex-wrap gap-2">
                  <Label className="hover:bg-accent inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-normal">
                    <ImageIcon className="size-4" />
                    anexar print
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_MIME.join(',')}
                      onChange={onImageChange}
                      className="hidden"
                    />
                  </Label>

                  <Label className="hover:bg-accent inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-normal">
                    <Upload className="size-4" />
                    enviar áudio
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept={ALLOWED_AUDIO_MIME.join(',')}
                      onChange={onAudioFileChange}
                      className="hidden"
                    />
                  </Label>

                  <Button
                    type="button"
                    variant={recording ? 'destructive' : 'outline'}
                    onClick={recording ? stopRecording : startRecording}
                  >
                    {recording ? (
                      <>
                        <Square className="size-4" /> parar
                      </>
                    ) : (
                      <>
                        <Mic className="size-4" /> gravar áudio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {previewUrl && (
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

            {audioUrl && (
              <div className="flex items-center gap-2 rounded-md border p-3">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={audioUrl} className="flex-1" />
                <Button type="button" variant="ghost" size="icon-sm" onClick={clearAudio}>
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>

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
                            ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_12px_-2px_rgba(160,24,42,0.7)]'
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

          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full shadow-[0_0_20px_-1px_rgba(160,24,42,0.55)]"
          >
            <Sparkles className="size-4" />
            {pending ? 'gerando...' : 'gerar 3 opções'}
          </Button>
        </form>
      </Form>

      {pending && (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            {loadingMessages[loadingIdx]}
          </CardContent>
        </Card>
      )}

      {result && result.audioVolta && (
        <Card className="border-foreground/20">
          <CardContent className="py-3 text-sm">
            💡 sugestão: pelo tom dela, talvez valha responder com áudio também.
          </CardContent>
        </Card>
      )}

      {result && (
        <Resultado
          data={result.data}
          crushId={result.crushId}
          generationId={result.generationId}
          onRegenerate={() => onSubmit(form.getValues())}
        />
      )}
    </div>
  );
}
