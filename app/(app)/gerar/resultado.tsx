'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Flame, Sparkles } from 'lucide-react';
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
}: {
  data: GeracaoOutput;
  crushId: string;
  generationId: string;
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

      {data.opcoes.map((opcao, i) => (
        <OpcaoCard
          key={i}
          index={i + 1}
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
  index,
  texto,
  tom,
  liked,
  canLike,
  onLike,
}: {
  index: number;
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-medium">opção {index}</CardTitle>
          <p className="text-muted-foreground mt-1 text-xs">{tom}</p>
        </div>
        <div className="flex items-center gap-1">
          {canLike && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onLike}
              title="essa funcionou?"
              aria-label={liked ? 'desmarcar que funcionou' : 'marcar que funcionou'}
              className={liked ? 'text-orange-500' : 'text-muted-foreground'}
            >
              <Flame className={liked ? 'size-4 fill-current' : 'size-4'} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={copiar}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'copiado' : 'copiar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm">{texto}</p>
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
