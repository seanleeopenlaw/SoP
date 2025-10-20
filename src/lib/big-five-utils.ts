/**
 * Big Five personality data transformation utilities
 * Centralizes all Big Five data transformations between UI format and database format
 */

import type { BigFiveGroup, Subtrait } from '@/types/profile';
import { transformBigFiveGroupToDatabase } from './big-five-config';

interface BigFiveProfileDB {
  neuroticismData?: any;
  extraversionData?: any;
  opennessData?: any;
  agreeablenessData?: any;
  conscientiousnessData?: any;
}

/**
 * Prepare Big Five data for saving to database
 * Transforms UI format (BigFiveGroup[]) to database format (5 separate JSONB fields)
 */
export function prepareBigFiveForSave(bigFiveData?: BigFiveGroup[]): BigFiveProfileDB | undefined {
  if (!bigFiveData || bigFiveData.length === 0) {
    return undefined;
  }

  // Create a Map for O(1) lookup instead of repeated .find() calls
  const groupMap = new Map(bigFiveData.map(g => [g.name, g]));

  const transformIfExists = (group: BigFiveGroup | undefined) => {
    return group ? transformBigFiveGroupToDatabase(group) : undefined;
  };

  return {
    neuroticismData: transformIfExists(groupMap.get('Neuroticism')),
    extraversionData: transformIfExists(groupMap.get('Extraversion')),
    opennessData: transformIfExists(groupMap.get('Openness to Experience')),
    agreeablenessData: transformIfExists(groupMap.get('Agreeableness')),
    conscientiousnessData: transformIfExists(groupMap.get('Conscientiousness')),
  };
}

/**
 * Filter out empty values from arrays
 * Used for coreValues and characterStrengths before saving
 */
export function filterEmptyValues(values?: string[]): string[] | undefined {
  if (!values) return undefined;
  const filtered = values.filter(v => v && v.trim() !== '');
  return filtered.length > 0 ? filtered : undefined;
}

/**
 * Normalize chronotype data for saving
 * Handles empty chronotype case (returns null to trigger deletion)
 */
export function normalizeChronotype(chronotype?: {
  types: string[];
  primaryType: string;
} | null): { types: string[]; primaryType: string } | null | undefined {
  if (!chronotype) return undefined;

  if (chronotype.types.length === 0) {
    return null; // Explicitly null to signal deletion
  }

  return {
    types: chronotype.types,
    primaryType: chronotype.primaryType,
  };
}

/**
 * Normalize goals data for saving
 */
export function normalizeGoals(goals?: {
  period: string;
  professionalGoals?: string | null;
  personalGoals?: string | null;
} | null): {
  period: string;
  professionalGoals?: string;
  personalGoals?: string;
} | undefined {
  if (!goals?.period) return undefined;

  return {
    period: goals.period,
    professionalGoals: goals.professionalGoals || undefined,
    personalGoals: goals.personalGoals || undefined,
  };
}
