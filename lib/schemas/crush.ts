import { z } from 'zod';

export const relationshipTypeOptions = [
  'namorada',
  'ficante',
  'conversante',
  'ex',
  'outras',
] as const;

export const relationshipTypeLabels: Record<(typeof relationshipTypeOptions)[number], string> = {
  namorada: 'namorada',
  ficante: 'ficante',
  conversante: 'conversante',
  ex: 'ex',
  outras: 'outras',
};

export const crushSchema = z.object({
  name: z.string().trim().min(1, 'qual o nome dela?').max(100, 'nome muito longo'),
  relationship_type: z.enum(relationshipTypeOptions),
  context: z.string().trim().max(5000, 'contexto muito longo (máximo 5000 caracteres)'),
});

export type CrushInput = z.infer<typeof crushSchema>;
