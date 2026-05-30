import { z } from 'zod';
import { ageRangeOptions } from './profile';

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

// ADR-021: age_range opcional. Quando preenchido, calibra registro da IA
// (cara 25 conversando com mulher 35 ≠ cara 40 com mulher 25).
export const crushSchema = z.object({
  name: z.string().trim().min(1, 'qual o nome dela?').max(100, 'nome muito longo'),
  relationship_type: z.enum(relationshipTypeOptions),
  age_range: z.enum(ageRangeOptions).nullable(),
  context: z.string().trim().max(5000, 'contexto muito longo (máximo 5000 caracteres)'),
});

export type CrushInput = z.infer<typeof crushSchema>;
