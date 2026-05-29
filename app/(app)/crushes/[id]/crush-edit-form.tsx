'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { updateCrush } from '../actions';

// TODO design: visual do form de edição (definir com humano)
export function CrushEditForm({ id, initial }: { id: string; initial: CrushInput }) {
  const form = useForm<CrushInput>({
    resolver: zodResolver(crushSchema),
    defaultValues: initial,
  });

  async function onSubmit(input: CrushInput) {
    const result = await updateCrush(id, input);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('atualizado.');
    form.reset(input);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>contexto</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="onde se conheceram, gostos, fase do rolo, piadas internas, red flags..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                {form.formState.isSubmitting ? 'salvando...' : 'salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
