'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const PILL = 'h-12 w-full rounded-full shadow-[0_4px_24px_-2px_rgba(160,24,42,0.6)]';
const LABEL = 'text-muted-foreground text-[11px] font-medium tracking-wider uppercase';

type Demo = { data: GeracaoOutput; crushId: string; generationId: string };

// Onboarding caprichado no padrão Onyx & Brasa (ADR-032 + ADR-033).
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

  // passo 3: mulher
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
      toast.error('algo deu errado. volta um passo.');
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
    <div className="mx-auto w-full max-w-md px-5 py-10">
      {/* progresso */}
      <div className="mb-8">
        <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.2em] uppercase">
          passo {step} de {TOTAL}
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={
                'h-1 flex-1 rounded-full transition-colors ' +
                (n <= step
                  ? 'bg-primary shadow-[0_0_8px_-1px_rgba(160,24,42,0.8)]'
                  : 'bg-card')
              }
            />
          ))}
        </div>
      </div>

      {/* PASSO 1 — quem é você */}
      {step === 1 && (
        <div className="space-y-6">
          <header>
            <h2 className="font-serif text-3xl font-medium tracking-tight">bora te conhecer</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              isso calibra o jeito que as respostas saem pra bater contigo. 30 segundos.
            </p>
          </header>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className={LABEL}>tua idade</Label>
              <Select value={ageRange || undefined} onValueChange={(v) => setAgeRange(v ?? '')}>
                <SelectTrigger className="h-11">
                  <SelectValue>
                    {ageRange
                      ? ageRangeLabels[ageRange as keyof typeof ageRangeLabels]
                      : 'escolhe...'}
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
              <Label className={LABEL}>situação relacional</Label>
              <Select value={marital || undefined} onValueChange={(v) => setMarital(v ?? '')}>
                <SelectTrigger className="h-11">
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
                <Label className={LABEL}>faz quanto tempo</Label>
                <Select value={timeSingle ?? undefined} onValueChange={setTimeSingle}>
                  <SelectTrigger className="h-11">
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

            <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <span className="text-sm font-medium">voltando ao mercado</span>
                <p className="text-muted-foreground text-xs">saiu de relação longa, tá retomando.</p>
              </div>
              <Switch checked={returning} onCheckedChange={setReturning} />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <span className="text-sm font-medium">tem filhos</span>
              <Switch checked={hasKids} onCheckedChange={setHasKids} />
            </label>
          </div>

          <Button onClick={next1} className={PILL}>
            continuar
          </Button>
        </div>
      )}

      {/* PASSO 2 — o que quer melhorar */}
      {step === 2 && (
        <div className="space-y-6">
          <header>
            <h2 className="font-serif text-3xl font-medium tracking-tight">
              o que você quer melhorar
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              escolhe quantas quiser. isso afina a IA pra ti.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {improvementAreaOptions.map((o) => {
              const checked = areas.includes(o);
              return (
                <label
                  key={o}
                  className={
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors ' +
                    (checked ? 'border-primary bg-primary/10' : 'hover:bg-accent')
                  }
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
            <Label className={LABEL}>teu objetivo</Label>
            <Select value={goal || undefined} onValueChange={(v) => setGoal(v ?? '')}>
              <SelectTrigger className="h-11">
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

          <div className="space-y-3">
            <Button onClick={next2} disabled={busy} className={PILL}>
              {busy ? 'salvando...' : 'continuar'}
            </Button>
            <BackLink onClick={() => setStep(1)} disabled={busy} />
          </div>
        </div>
      )}

      {/* PASSO 3 — primeira mulher */}
      {step === 3 && (
        <div className="space-y-6">
          <header>
            <h2 className="font-serif text-3xl font-medium tracking-tight">tua primeira mulher</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              cada uma tem um perfil próprio. quanto mais contexto, melhor a IA calibra.
            </p>
          </header>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className={LABEL}>nome (ou apelido)</Label>
              <Input
                value={crushName}
                onChange={(e) => setCrushName(e.target.value)}
                placeholder="ex: marina"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className={LABEL}>tipo de relação</Label>
              <Select value={crushRel} onValueChange={(v) => setCrushRel(v ?? 'conversante')}>
                <SelectTrigger className="h-11">
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
              <Label className={LABEL}>idade dela (opcional)</Label>
              <Select
                value={crushAge ?? '__unknown__'}
                onValueChange={(v) => setCrushAge(v === '__unknown__' ? null : v)}
              >
                <SelectTrigger className="h-11">
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
              <Label className={LABEL}>contexto (opcional)</Label>
              <Textarea
                rows={3}
                value={crushContext}
                onChange={(e) => setCrushContext(e.target.value)}
                placeholder="como rolou, o que tu sabe dela, onde tá a conversa..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={next3} disabled={busy} className={PILL}>
              {busy ? 'salvando...' : 'continuar'}
            </Button>
            <BackLink onClick={() => setStep(2)} disabled={busy} />
          </div>
        </div>
      )}

      {/* PASSO 4 — cola a mensagem dela */}
      {step === 4 && (
        <div className="space-y-6">
          <header>
            <h2 className="font-serif text-3xl font-medium tracking-tight">
              cola algo que ela te mandou
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              não tem um caso agora? usa o exemplo — é só pra ver a IA trabalhar.
            </p>
          </header>

          <div className="space-y-2">
            <Label className={LABEL}>a mensagem dela</Label>
            <Textarea
              rows={3}
              value={herMessage}
              onChange={(e) => setHerMessage(e.target.value)}
              placeholder="cola exatamente o que ela mandou..."
            />
            <button
              type="button"
              className="text-primary text-xs font-medium transition-opacity hover:opacity-80"
              onClick={() => setHerMessage(MSG_EXEMPLO)}
            >
              usar um exemplo
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className={LABEL}>intensidade</Label>
              <span className="text-primary text-[11px] font-medium tracking-wider uppercase">
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
            <Label className={LABEL}>intenção</Label>
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
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_12px_-2px_rgba(160,24,42,0.7)]'
                        : 'border-border hover:border-foreground/30')
                    }
                  >
                    {intentLabels[o]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={gerar} className={PILL}>
              <Sparkles className="size-4" />
              gerar
            </Button>
            <BackLink onClick={() => setStep(3)} />
          </div>
        </div>
      )}

      {/* PASSO 5 — demonstração ao vivo */}
      {step === 5 && (
        <div className="space-y-6">
          <header className="text-center">
            <h2 className="font-serif text-3xl font-medium tracking-tight">
              {demo ? 'tá calibrada.' : 'montando tuas 3 opções...'}
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {demo
                ? 'esse é teu app. cola o que ela mandou, escolhe o tom, e a IA te dá 3 saídas.'
                : 'a IA tá lendo teu perfil, o perfil dela e o tom que você pediu.'}
            </p>
          </header>

          {busy && !demo && (
            <div className="text-muted-foreground rounded-xl border py-12 text-center text-sm">
              gerando...
            </div>
          )}

          {demo && (
            <Resultado
              data={demo.data}
              crushId={demo.crushId}
              generationId={demo.generationId}
            />
          )}

          {!busy && (
            <Button onClick={entrar} className={PILL}>
              {demo ? 'entrar no app' : 'ir pro app'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function BackLink({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-muted-foreground hover:text-foreground mx-auto block text-sm transition-colors disabled:opacity-50"
    >
      voltar
    </button>
  );
}
