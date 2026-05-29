import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { relationshipTypeLabels } from '@/lib/schemas/crush';
import { NovaCrushButton } from './nova-crush-button';

export default async function CrushesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: crushes } = await supabase
    .from('crushes')
    .select('id, name, relationship_type, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">tuas crushes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            cada uma tem um perfil próprio. quanto mais contexto, melhor a IA calibra.
          </p>
        </div>
        <NovaCrushButton />
      </header>

      {!crushes || crushes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-base">tua agenda tá vazia.</p>
            <p className="text-muted-foreground text-sm">
              começa pela que tá te tirando o sono.
            </p>
            <NovaCrushButton variant="default" label="adicionar primeira" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {crushes.map((c) => {
            const type = c.relationship_type as keyof typeof relationshipTypeLabels;
            return (
              <Link key={c.id} href={`/crushes/${c.id}`} className="group">
                <Card className="transition-colors group-hover:border-foreground/30">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="truncate">{c.name}</span>
                      <Badge variant="secondary" className="shrink-0">
                        {relationshipTypeLabels[type] ?? type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
