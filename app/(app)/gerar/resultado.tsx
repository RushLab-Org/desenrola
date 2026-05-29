'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Sparkles, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeracaoOutput } from '@/lib/schemas/geracao';
import { adicionarInfoNaCrush, marcarComoVitoria } from './actions';

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
        <OpcaoCard key={i} index={i + 1} texto={opcao.texto} tom={opcao.tom} />
      ))}

      {data.skills_aplicadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              🎯 skills aplicadas (vira aula)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.skills_aplicadas.map((skill) => (
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

      {generationId && <MarcarVitoriaCard generationId={generationId} />}
    </div>
  );
}

function OpcaoCard({ index, texto, tom }: { index: number; texto: string; tom: string }) {
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
        <Button variant="ghost" size="sm" onClick={copiar}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'copiado' : 'copiar'}
        </Button>
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

function MarcarVitoriaCard({ generationId }: { generationId: string }) {
  const [marked, setMarked] = useState(false);
  const [pending, startTransition] = useTransition();

  function marcar() {
    startTransition(async () => {
      const result = await marcarComoVitoria(generationId, !marked);
      if (result.ok) {
        setMarked(!marked);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex justify-center pt-2">
      <Button onClick={marcar} variant={marked ? 'secondary' : 'ghost'} size="sm" disabled={pending}>
        <ThumbsUp className="size-4" />
        {marked ? 'marcada como vitória' : 'essa funcionou?'}
      </Button>
    </div>
  );
}
