import { z } from 'zod';

// Profile creation validation schema
export const profileCreateSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format').toLowerCase(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  team: z.string().max(255, 'Team name too long').optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
});

// Chronotype validation
const chronotypeSchema = z.object({
  types: z.array(z.enum(['Lion', 'Bear', 'Wolf', 'Dolphin'])),
  primaryType: z.enum(['Lion', 'Bear', 'Wolf', 'Dolphin']).optional(),
}).refine(
  (data) => {
    // If types array is empty, primaryType should not be set
    if (data.types.length === 0) return !data.primaryType;
    // If types array has items, primaryType must be set and be one of the types
    return data.primaryType && data.types.includes(data.primaryType);
  },
  {
    message: 'Primary type must be one of the selected types',
  }
);

// Big Five validation
const subtraitSchema = z.object({
  name: z.string(),
  level: z.enum(['High', 'Average', 'Low']),
  score: z.number().int().min(0).max(999).optional(),
});

const bigFiveGroupSchema = z.object({
  name: z.string(),
  color: z.string(),
  level: z.enum(['High', 'Average', 'Low']),
  score: z.number().int().min(0).max(999).optional(),
  subtraits: z.array(subtraitSchema),
});

// Big Five Database format (what's actually sent to the API)
const bigFiveDataSchema = z.any();

// Goals validation
const goalsSchema = z.object({
  period: z.string().min(1, 'Period is required').max(100),
  professionalGoals: z.string().optional(),
  personalGoals: z.string().optional(),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  team: z.string().max(255).optional(),
  birthday: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  coreValues: z.array(z.string()).max(5).optional(),
  characterStrengths: z.array(z.string()).max(5).optional(),
  chronotype: chronotypeSchema.optional().nullable(),
  bigFiveProfile: z.object({
    opennessData: bigFiveDataSchema.optional(),
    conscientiousnessData: bigFiveDataSchema.optional(),
    extraversionData: bigFiveDataSchema.optional(),
    agreeablenessData: bigFiveDataSchema.optional(),
    neuroticismData: bigFiveDataSchema.optional(),
  }).optional(),
  goals: goalsSchema.optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
