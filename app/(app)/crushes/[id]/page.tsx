import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CrushEditForm } from './crush-edit-form';
import { DeleteCrushButton } from './delete-crush-button';

export default async function CrushDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: crush } = await supabase
    .from('crushes')
    .select('id, name, relationship_type, age_range, context, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!crush) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/crushes"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        voltar
      </Link>

      <header className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{crush.name}</h1>
        <DeleteCrushButton id={crush.id} name={crush.name} />
      </header>

      <CrushEditForm
        id={crush.id}
        initial={{
          name: crush.name,
          relationship_type: crush.relationship_type as never,
          age_range: crush.age_range as never,
          context: crush.context ?? '',
        }}
      />
    </div>
  );
}
