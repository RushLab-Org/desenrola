'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ageRangeOptions,
  ageRangeLabels,
  improvementAreaOptions,
  improvementAreaLabels,
  maritalStatusOptions,
  maritalStatusLabels,
  primaryGoalOptions,
  primaryGoalLabels,
  profileSchema,
  timeSingleOptions,
  timeSingleLabels,
  type ProfileInput,
} from '@/lib/schemas/profile';
import { updateUserProfile } from './actions';

type Initial = {
  age_range: string | null;
  marital_status: string | null;
  time_single: string | null;
  returning_to_market: boolean;
  has_children: boolean;
  improvement_areas: string[];
  primary_goal: string | null;
};

// TODO design: visual definir com humano via Claude Design
export function PerfilForm({
  initial,
  onboardingCompleted,
}: {
  initial: Initial;
  onboardingCompleted: boolean;
}) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age_range: (initial.age_range as ProfileInput['age_range']) ?? undefined,
      marital_status:
        (initial.marital_status as ProfileInput['marital_status']) ?? undefined,
      time_single: (initial.time_single as ProfileInput['time_single']) ?? null,
      returning_to_market: initial.returning_to_market,
      has_children: initial.has_children,
      improvement_areas:
        (initial.improvement_areas as ProfileInput['improvement_areas']) ?? [],
      primary_goal: (initial.primary_goal as ProfileInput['primary_goal']) ?? undefined,
    },
  });

  const maritalStatus = form.watch('marital_status');
  const showTimeSingle = maritalStatus === 'recently_single';

  async function onSubmit(input: ProfileInput) {
    // se mudou pra status que não é "recently_single", zera time_single
    const payload: ProfileInput = {
      ...input,
      time_single: input.marital_status === 'recently_single' ? input.time_single : null,
    };

    const result = await updateUserProfile(payload);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(onboardingCompleted ? 'perfil atualizado.' : 'IA calibrada.');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>quem é você</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="age_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>idade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="escolhe..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ageRangeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {ageRangeLabels[opt]}
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
              name="marital_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>situação relacional</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="escolhe..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maritalStatusOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {maritalStatusLabels[opt]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showTimeSingle && (
              <FormField
                control={form.control}
                name="time_single"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>faz quanto tempo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="escolhe..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSingleOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {timeSingleLabels[opt]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="returning_to_market"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div>
                    <FormLabel>voltando ao mercado</FormLabel>
                    <p className="text-muted-foreground text-xs">
                      saiu de relação longa, tá retomando.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="has_children"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div>
                    <FormLabel>tem filhos</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>o que você quer melhorar</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="improvement_areas"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {improvementAreaOptions.map((opt) => {
                      const checked = field.value?.includes(opt) ?? false;
                      return (
                        <label
                          key={opt}
                          className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md border p-3"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(state) => {
                              if (state) {
                                field.onChange([...(field.value ?? []), opt]);
                              } else {
                                field.onChange(
                                  (field.value ?? []).filter((v) => v !== opt),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{improvementAreaLabels[opt]}</span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldState.error && (
                    <p className="text-destructive mt-2 text-sm">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>teu objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="primary_goal"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="escolhe..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {primaryGoalOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {primaryGoalLabels[opt]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'salvando...' : 'salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
