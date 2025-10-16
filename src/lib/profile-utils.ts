/**
 * Utility functions for profile operations
 */

interface ProfileForCompleteness {
  name?: string;
  email?: string;
  team?: string | null;
  chronotype?: {
    types?: string[];
  } | null;
  coreValues?: {
    values?: string[];
  } | null;
  characterStrengths?: {
    strengths?: string[];
  } | null;
  bigFiveProfile?: { id?: string } | null;
}

/**
 * Calculate profile completeness percentage
 * @param profile - Profile data to calculate completeness for
 * @returns Percentage (0-100) of profile completion
 */
export function calculateProfileCompleteness(profile: ProfileForCompleteness): number {
  let completed = 0;
  const total = 7;

  if (profile.name) completed++;
  if (profile.email) completed++;
  if (profile.team) completed++;
  if (profile.chronotype?.types && profile.chronotype.types.length > 0) completed++;
  if (profile.coreValues?.values && profile.coreValues.values.length > 0) completed++;
  if (profile.characterStrengths?.strengths && profile.characterStrengths.strengths.length > 0) completed++;
  if (profile.bigFiveProfile) completed++;

  return Math.round((completed / total) * 100);
}
