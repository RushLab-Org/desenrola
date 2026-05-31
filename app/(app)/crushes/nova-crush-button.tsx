'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  crushSchema,
  relationshipTypeLabels,
  relationshipTypeOptions,
  type CrushInput,
} from '@/lib/schemas/crush';
import { ageRangeOptions, ageRangeLabels } from '@/lib/schemas/profile';
import { createCrush } from './actions';

const AGE_UNKNOWN = '__unknown__';

// TODO design: visual do dialog/form (definir com humano)
export function NovaCrushButton({
  variant = 'default',
  label,
}: {
  variant?: 'default' | 'outline';
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CrushInput>({
    resolver: zodResolver(crushSchema),
    defaultValues: {
      name: '',
      relationship_type: 'conversante',
      age_range: null,
      context: '',
    },
  });

  async function onSubmit(input: CrushInput) {
    const result = await createCrush(input);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('mulher adicionada.');
    setOpen(false);
    form.reset();
    router.push(`/crushes/${result.id}`);
  }

  return (
    <>
      <Button
        variant={variant}
        size={label ? 'default' : 'sm'}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        {label ?? 'nova mulher'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>nova mulher</DialogTitle>
          <DialogDescription>
            quanto mais contexto, melhor a IA calibra. dá pra adicionar mais depois.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>nome</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder="ex: Marina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>tipo de relação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationshipTypeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {relationshipTypeLabels[opt]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age_range"
              render={({ field }) => {
                const value = field.value ?? AGE_UNKNOWN;
                const label =
                  field.value && field.value in ageRangeLabels
                    ? ageRangeLabels[field.value as keyof typeof ageRangeLabels]
                    : 'não sei';
                return (
                  <FormItem>
                    <FormLabel>idade dela (opcional, mas calibra melhor)</FormLabel>
                    <Select
                      value={value}
                      onValueChange={(v) =>
                        field.onChange(v === AGE_UNKNOWN ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>{label}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AGE_UNKNOWN}>não sei</SelectItem>
                        {ageRangeOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {ageRangeLabels[opt]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>contexto (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="onde se conheceram, gostos, fase do rolo, piadas internas, red flags..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'salvando...' : 'salvar'}
              </Button>
            </div>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
