'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ageRangeOptions,
  ageRangeLabels,
  improvementAreaOptions,
  improvementAreaLabels,
  maritalStatusOptions,
  maritalStatusLabels,
  primaryGoalOptions,
  primaryGoalLabels,
  timeSingleOptions,
  timeSingleLabels,
  type ProfileInput,
} from '@/lib/schemas/profile';
import { relationshipTypeOptions, relationshipTypeLabels } from '@/lib/schemas/crush';
import {
  intensityLabels,
  intentLabels,
  intentOptions,
  type GeracaoOutput,
} from '@/lib/schemas/geracao';
import { updateUserProfile } from '../perfil/actions';
import { createCrush } from '../crushes/actions';
import { gerarResposta } from '../gerar/actions';
import { Resultado } from '../gerar/resultado';

const TOTAL = 5;
const MSG_EXEMPLO = 'oi sumido, achei que tinha morrido kkk';

type Demo = { data: GeracaoOutput; crushId: string; generationId: string };

// TODO design: visual do onboarding (definir com humano via Claude Design)
export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  // passo 1-2: perfil
  const [ageRange, setAgeRange] = useState('');
  const [marital, setMarital] = useState('');
  const [timeSingle, setTimeSingle] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);
  const [hasKids, setHasKids] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  // passo 3: crush
  const [crushName, setCrushName] = useState('');
  const [crushRel, setCrushRel] = useState<string>('conversante');
  const [crushAge, setCrushAge] = useState<string | null>(null);
  const [crushContext, setCrushContext] = useState('');
  const [crushId, setCrushId] = useState<string | null>(null);

  // passo 4-5: geração
  const [herMessage, setHerMessage] = useState('');
  const [intensity, setIntensity] = useState(2);
  const [intent, setIntent] = useState<(typeof intentOptions)[number]>('responder_normal');
  const [demo, setDemo] = useState<Demo | null>(null);

  function next1() {
    if (!ageRange || !marital) {
      toast.error('preenche idade e situação.');
      return;
    }
    if (marital === 'recently_single' && !timeSingle) {
      toast.error('faz quanto tempo que tá solteiro?');
      return;
    }
    setStep(2);
  }

  async function next2() {
    if (areas.length === 0) {
      toast.error('escolhe pelo menos uma área pra melhorar.');
      return;
    }
    if (!goal) {
      toast.error('qual teu objetivo?');
      return;
    }
    setBusy(true);
    try {
      const payload: ProfileInput = {
        age_range: ageRange as ProfileInput['age_range'],
        marital_status: marital as ProfileInput['marital_status'],
        time_single:
          marital === 'recently_single'
            ? (timeSingle as ProfileInput['time_single'])
            : null,
        returning_to_market: returning,
        has_children: hasKids,
        improvement_areas: areas as ProfileInput['improvement_areas'],
        primary_goal: goal as ProfileInput['primary_goal'],
      };
      const r = await updateUserProfile(payload);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  async function next3() {
    if (!crushName.trim()) {
      toast.error('qual o nome dela?');
      return;
    }
    setBusy(true);
    try {
      const r = await createCrush({
        name: crushName.trim(),
        relationship_type: crushRel as (typeof relationshipTypeOptions)[number],
        age_range: crushAge as ProfileInput['age_range'] | null,
        context: crushContext.trim(),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setCrushId(r.id);
      setStep(4);
    } finally {
      setBusy(false);
    }
  }

  async function gerar() {
    if (!herMessage.trim()) {
      toast.error('cola algo que ela te mandou (ou usa o exemplo).');
      return;
    }
    if (!crushId) {
      toast.error('algo deu errado com a crush. volta um passo.');
      return;
    }
    setStep(5);
    setBusy(true);
    try {
      const r = await gerarResposta({
        crush_id: crushId,
        her_message: herMessage.trim(),
        intensity,
        intent,
        extra_context: '',
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setDemo({ data: r.data, crushId: r.crushId, generationId: r.generationId });
    } finally {
      setBusy(false);
    }
  }

  function entrar() {
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <p className="text-muted-foreground mb-2 text-xs">
        passo {step} de {TOTAL}
      </p>

      {/* PASSO 1 — quem é você */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>bora te conhecer</CardTitle>
            <CardDescription>
              isso calibra o jeito que as respostas saem pra bater contigo. 30 segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>tua idade</Label>
              <Select value={ageRange || undefined} onValueChange={(v) => setAgeRange(v ?? '')}>
                <SelectTrigger>
                  <SelectValue>
                    {ageRange ? ageRangeLabels[ageRange as keyof typeof ageRangeLabels] : 'escolhe...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ageRangeOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {ageRangeLabels[o]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>situação relacional</Label>
              <Select value={marital || undefined} onValueChange={(v) => setMarital(v ?? '')}>
                <SelectTrigger>
                  <SelectValue>
                    {marital
                      ? maritalStatusLabels[marital as keyof typeof maritalStatusLabels]
                      : 'escolhe...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {maritalStatusOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {maritalStatusLabels[o]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {marital === 'recently_single' && (
              <div className="space-y-2">
                <Label>faz quanto tempo</Label>
                <Select value={timeSingle ?? undefined} onValueChange={setTimeSingle}>
                  <SelectTrigger>
                    <SelectValue>
                      {timeSingle
                        ? timeSingleLabels[timeSingle as keyof typeof timeSingleLabels]
                        : 'escolhe...'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSingleOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {timeSingleLabels[o]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <label className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div>
                <span className="text-sm font-medium">voltando ao mercado</span>
                <p className="text-muted-foreground text-xs">saiu de relação longa, tá retomando.</p>
              </div>
              <Switch checked={returning} onCheckedChange={setReturning} />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border p-3">
              <span className="text-sm font-medium">tem filhos</span>
              <Switch checked={hasKids} onCheckedChange={setHasKids} />
            </label>

            <div className="flex justify-end">
              <Button onClick={next1}>continuar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 2 — o que quer melhorar + objetivo */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>o que você quer melhorar</CardTitle>
            <CardDescription>escolhe quantas quiser. isso afina a IA pra ti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {improvementAreaOptions.map((o) => {
                const checked = areas.includes(o);
                return (
                  <label
                    key={o}
                    className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md border p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(s) =>
                        setAreas((prev) => (s ? [...prev, o] : prev.filter((v) => v !== o)))
                      }
                    />
                    <span className="text-sm">{improvementAreaLabels[o]}</span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label>teu objetivo</Label>
              <Select value={goal || undefined} onValueChange={(v) => setGoal(v ?? '')}>
                <SelectTrigger>
                  <SelectValue>
                    {goal ? primaryGoalLabels[goal as keyof typeof primaryGoalLabels] : 'escolhe...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {primaryGoalOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {primaryGoalLabels[o]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={busy}>
                voltar
              </Button>
              <Button onClick={next2} disabled={busy}>
                {busy ? 'salvando...' : 'continuar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 3 — primeira crush */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>tua primeira mulher</CardTitle>
            <CardDescription>
              cada uma tem um perfil próprio. quanto mais contexto, melhor a IA calibra.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>nome (ou apelido)</Label>
              <Input
                value={crushName}
                onChange={(e) => setCrushName(e.target.value)}
                placeholder="ex: marina"
              />
            </div>

            <div className="space-y-2">
              <Label>tipo de relação</Label>
              <Select value={crushRel} onValueChange={(v) => setCrushRel(v ?? 'conversante')}>
                <SelectTrigger>
                  <SelectValue>
                    {relationshipTypeLabels[crushRel as keyof typeof relationshipTypeLabels]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypeOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {relationshipTypeLabels[o]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>idade dela (opcional)</Label>
              <Select
                value={crushAge ?? '__unknown__'}
                onValueChange={(v) => setCrushAge(v === '__unknown__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {crushAge ? ageRangeLabels[crushAge as keyof typeof ageRangeLabels] : 'não sei'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unknown__">não sei</SelectItem>
                  {ageRangeOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {ageRangeLabels[o]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>contexto (opcional)</Label>
              <Textarea
                rows={3}
                value={crushContext}
                onChange={(e) => setCrushContext(e.target.value)}
                placeholder="como rolou, o que tu sabe dela, onde tá a conversa..."
              />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={busy}>
                voltar
              </Button>
              <Button onClick={next3} disabled={busy}>
                {busy ? 'salvando...' : 'continuar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 4 — cola a mensagem dela */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>cola algo que ela te mandou</CardTitle>
            <CardDescription>
              não tem um caso agora? usa o exemplo — é só pra ver a IA trabalhar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>a mensagem dela</Label>
              <Textarea
                rows={3}
                value={herMessage}
                onChange={(e) => setHerMessage(e.target.value)}
                placeholder="cola exatamente o que ela mandou..."
              />
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => setHerMessage(MSG_EXEMPLO)}
              >
                usar um exemplo
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>intensidade</Label>
                <span className="text-muted-foreground text-xs">
                  {intensityLabels[intensity as 1 | 2 | 3 | 4 | 5]}
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[intensity]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  if (typeof val === 'number') setIntensity(val);
                }}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>intenção</Label>
              <div className="flex flex-wrap gap-2">
                {intentOptions.map((o) => {
                  const active = intent === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setIntent(o)}
                      className={
                        'rounded-full border px-3 py-1 text-sm transition-colors ' +
                        (active
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground/30')
                      }
                    >
                      {intentLabels[o]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                voltar
              </Button>
              <Button onClick={gerar}>
                <Sparkles className="size-4" />
                gerar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 5 — demonstração ao vivo */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {demo ? 'tá calibrada. esse é teu app.' : 'montando tuas 3 opções...'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {demo
                ? 'é assim toda vez: cola o que ela mandou, escolhe o tom, e a IA te dá 3 saídas.'
                : 'a IA tá lendo teu perfil, o perfil dela e o tom que você pediu.'}
            </p>
          </div>

          {busy && !demo && (
            <Card>
              <CardContent className="text-muted-foreground py-10 text-center text-sm">
                gerando...
              </CardContent>
            </Card>
          )}

          {demo && (
            <Resultado
              data={demo.data}
              crushId={demo.crushId}
              generationId={demo.generationId}
            />
          )}

          {!busy && (
            <div className="flex justify-center">
              <Button onClick={entrar} className="w-full sm:w-auto">
                {demo ? 'entrar no app' : 'ir pro app'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
