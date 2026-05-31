import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReembolsoButton } from './reembolso-button';
import { SenhaForm } from './senha-form';

const STATUS_LABELS: Record<string, string> = {
  active: 'ativo',
  pending: 'pendente',
  refunded: 'reembolsado',
  cancelled: 'cancelado',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// TODO design: visual de configurações (definir com humano via Claude Design)
export default async function ConfiguracoesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'email, subscription_status, subscription_type, purchased_at, refunded_at, payment_method',
    )
    .eq('id', user.id)
    .single();

  const status = profile?.subscription_status ?? 'pending';
  const purchasedAt = formatDate(profile?.purchased_at ?? null);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">configurações</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>tua conta</CardTitle>
          <CardDescription>{profile?.email ?? user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">status</span>
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">tipo</span>
            <span>{profile?.subscription_type === 'lifetime' ? 'vitalício' : '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">comprou em</span>
            <span>{purchasedAt}</span>
          </div>
          {profile?.refunded_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">reembolsado em</span>
              <span>{formatDate(profile.refunded_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>reembolso</CardTitle>
          <CardDescription>
            tem até 7 dias da compra pra pedir reembolso por qualquer motivo. sem
            perguntas, sem burocracia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'refunded' ? (
            <p className="text-muted-foreground text-sm">
              já processado em {formatDate(profile?.refunded_at ?? null)}.
            </p>
          ) : status === 'pending' ? (
            <p className="text-muted-foreground text-sm">
              compra ainda pendente — sem nada pra reembolsar por enquanto.
            </p>
          ) : (
            <ReembolsoButton email={profile?.email ?? user.email ?? ''} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>senha de acesso</CardTitle>
          <CardDescription>
            define uma senha pra entrar com email e senha, sem precisar do link toda vez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SenhaForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>excluir conta</CardTitle>
          <CardDescription>
            apaga teu perfil, crushes, histórico de gerações. não tem como desfazer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            disponível no Marco 6 (polish). por enquanto, fala com o suporte se precisar
            urgente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
