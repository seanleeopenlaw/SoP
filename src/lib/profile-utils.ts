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
  goals?: {
    professionalGoals?: string | null;
    personalGoals?: string | null;
  } | null;
}

/**
 * Calculate profile completeness percentage
 * @param profile - Profile data to calculate completeness for
 * @returns Percentage (0-100) of profile completion
 */
export function calculateProfileCompleteness(profile: ProfileForCompleteness): number {
  let completed = 0;
  const total = 9; // Increased to include professional and personal goals

  if (profile.name) completed++;
  if (profile.email) completed++;
  if (profile.team) completed++;
  if (profile.chronotype?.types && profile.chronotype.types.length > 0) completed++;
  if (profile.coreValues?.values && profile.coreValues.values.length > 0) completed++;
  if (profile.characterStrengths?.strengths && profile.characterStrengths.strengths.length > 0) completed++;
  if (profile.bigFiveProfile) completed++;

  // Goals: both professional and personal must be filled for completion
  if (profile.goals?.professionalGoals && profile.goals.professionalGoals.trim() !== '') completed++;
  if (profile.goals?.personalGoals && profile.goals.personalGoals.trim() !== '') completed++;

  return Math.round((completed / total) * 100);
}
