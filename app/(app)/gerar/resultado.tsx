'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Flame, RefreshCw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { intentOptions, type GeracaoOutput } from '@/lib/schemas/geracao';
import { adicionarInfoNaCrush, marcarOpcaoVitoria } from './actions';

// TODO design: visual do resultado (definir com humano via Claude Design)
export function Resultado({
  data,
  crushId,
  generationId,
  onRegenerate,
}: {
  data: GeracaoOutput;
  crushId: string;
  generationId: string;
  onRegenerate?: () => void;
}) {
  // ADR-030: like por opção — qual das 3 funcionou. Marcado na tela do resultado.
  const [likedIndex, setLikedIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Fix determinístico: o modelo às vezes coloca uma INTENÇÃO (ex: "sexualizar")
  // em skills_aplicadas mesmo o prompt proibindo. Filtra aqui pra nunca vazar.
  const skillsLimpas = data.skills_aplicadas.filter(
    (s) => !(intentOptions as readonly string[]).includes(s),
  );

  function handleLike(i: number) {
    const prev = likedIndex;
    const next = likedIndex === i ? null : i;
    setLikedIndex(next); // otimista
    startTransition(async () => {
      const r = await marcarOpcaoVitoria(generationId, next);
      if (!r.ok) {
        toast.error(r.error);
        setLikedIndex(prev); // reverte
      } else if (next !== null) {
        toast.success('massa. anotado que essa funcionou.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {data.alerta && (
        <Card className="border-yellow-500/50">
          <CardContent className="py-3 text-sm">⚠ {data.alerta}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">leitura da situação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">{data.leitura}</CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-medium tracking-[0.15em] uppercase">
          3 opções calibradas
        </span>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="text-primary inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          >
            <RefreshCw className="size-3.5" />
            gerar novamente
          </button>
        )}
      </div>

      {data.opcoes.map((opcao, i) => (
        <OpcaoCard
          key={i}
          texto={opcao.texto}
          tom={opcao.tom}
          liked={likedIndex === i}
          canLike={!!generationId}
          onLike={() => handleLike(i)}
        />
      ))}

      {skillsLimpas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              🎯 skills aplicadas (vira aula)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skillsLimpas.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill.replace(/_/g, ' ')}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {data.info_nova_detectada && (
        <InfoNovaCard info={data.info_nova_detectada} crushId={crushId} />
      )}
    </div>
  );
}

function OpcaoCard({
  texto,
  tom,
  liked,
  canLike,
  onLike,
}: {
  texto: string;
  tom: string;
  liked: boolean;
  canLike: boolean;
  onLike: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('navegador não deixou copiar. seleciona manualmente.');
    }
  }

  return (
    <Card className="border-l-2 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-0">
        <span className="text-primary text-[10px] font-medium tracking-[0.15em] uppercase">
          {tom}
        </span>
        {canLike && (
          <button
            type="button"
            onClick={onLike}
            title="essa funcionou?"
            aria-label={liked ? 'desmarcar que funcionou' : 'marcar que funcionou'}
            className={
              'transition-colors ' +
              (liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground')
            }
          >
            <Flame className={liked ? 'size-4 fill-current' : 'size-4'} />
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{texto}</p>
        <Button variant="outline" size="sm" onClick={copiar} className="w-full">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'copiado' : 'copiar'}
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoNovaCard({ info, crushId }: { info: string; crushId: string }) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      const result = await adicionarInfoNaCrush(crushId, info);
      if (result.ok) {
        setSaved(true);
        toast.success('info salva no perfil dela.');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="border-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" />
          info nova detectada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{info}</p>
        <Button onClick={salvar} disabled={pending || saved} variant="outline" size="sm">
          {saved ? 'salvo' : pending ? 'salvando...' : 'salvar no perfil dela'}
        </Button>
      </CardContent>
    </Card>
  );
}
