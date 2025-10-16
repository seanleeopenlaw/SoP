// Big Five Personality Traits Configuration and Utilities

export const BIG_FIVE_TEMPLATE = [
  {
    name: 'Neuroticism',
    color: '#7C3AED', // Tailwind violet-600 - Higher contrast purple
    subtraits: ['Anxiety', 'Anger', 'Depression', 'Self-Consciousness', 'Immoderation', 'Vulnerability'],
  },
  {
    name: 'Extraversion',
    color: '#006CFA', // Custom blue - Higher contrast
    subtraits: ['Friendliness', 'Gregariousness', 'Assertiveness', 'Activity Level', 'Excitement Seeking', 'Cheerfulness'],
  },
  {
    name: 'Openness to Experience',
    color: '#DB2777', // Tailwind pink-600 - Higher contrast pink
    subtraits: ['Imagination', 'Artistic Interests', 'Emotionality', 'Adventurousness', 'Intellect', 'Liberalism'],
  },
  {
    name: 'Agreeableness',
    color: '#E18600', // Custom orange - Higher contrast
    subtraits: ['Trust', 'Morality', 'Altruism', 'Cooperation', 'Modesty', 'Sympathy'],
  },
  {
    name: 'Conscientiousness',
    color: '#059669', // Tailwind emerald-600 - Higher contrast green
    subtraits: ['Self-Efficacy', 'Orderliness', 'Dutifulness', 'Achievement', 'Self Discipline', 'Cautiousness'],
  },
] as const;

export type TraitLevel = 'High' | 'Average' | 'Low';

export interface Subtrait {
  name: string;
  level: TraitLevel;
  score?: number;
}

export interface BigFiveGroup {
  name: string;
  color: string;
  level: TraitLevel;
  score?: number;
  subtraits: Subtrait[];
}

/**
 * Transforms Big Five personality data from database format (JSONB) to UI format.
 * Fills in default values from the template if data is missing.
 *
 * @param dbData - The Big Five trait data from database (JSONB column)
 * @param templateIndex - Index of the trait in BIG_FIVE_TEMPLATE (0-4)
 * @returns Transformed data ready for UI consumption, or null if no data
 */
export function transformBigFiveData(
  dbData: any,
  templateIndex: number
): BigFiveGroup | null {
  const template = BIG_FIVE_TEMPLATE[templateIndex];
  if (!template) return null;
  if (!dbData) return null;

  return {
    name: dbData.groupName || dbData.name || template.name,
    color: dbData.color || template.color,
    level: (dbData.overallLevel as TraitLevel) || (dbData.level as TraitLevel) || 'Average',
    score: dbData.overallScore ?? dbData.score,
    subtraits: template.subtraits.map((subtraitName, index) => {
      const dbSubtrait = dbData.subtraits?.[index];
      return {
        name: subtraitName,
        level: (dbSubtrait?.level as TraitLevel) || 'Average',
        score: dbSubtrait?.score,
      };
    }),
  };
}

/**
 * Transforms a complete Big Five profile from database to UI format.
 * Maps the 5 JSONB columns to an array of BigFiveGroup.
 *
 * @param profile - Big Five profile with 5 trait data columns
 * @returns Array of 5 BigFiveGroup objects for the UI
 */
export function transformProfileToBigFiveData(profile: {
  neuroticismData: any;
  extraversionData: any;
  opennessData: any;
  agreeablenessData: any;
  conscientiousnessData: any;
}): BigFiveGroup[] {
  return [
    transformBigFiveData(profile.neuroticismData, 0),
    transformBigFiveData(profile.extraversionData, 1),
    transformBigFiveData(profile.opennessData, 2),
    transformBigFiveData(profile.agreeablenessData, 3),
    transformBigFiveData(profile.conscientiousnessData, 4),
  ].filter((data): data is BigFiveGroup => data !== null);
}

/**
 * Creates a default Big Five group with 'Average' level for all traits.
 * Used when no data exists for a trait.
 *
 * @param groupIndex - Index of the trait in BIG_FIVE_TEMPLATE (0-4)
 * @returns Default BigFiveGroup with all subtraits set to 'Average'
 */
export function createDefaultGroup(groupIndex: number): BigFiveGroup {
  const template = BIG_FIVE_TEMPLATE[groupIndex];
  return {
    name: template.name,
    color: template.color,
    level: 'Average',
    subtraits: template.subtraits.map((name) => ({
      name,
      level: 'Average',
    })),
  };
}

/**
 * Maps subtrait display names to image filenames.
 * Converts UI display names (e.g., "Self-Consciousness") to image filenames (e.g., "Self-consciousness.png")
 *
 * @param subtraitName - The display name of the subtrait (e.g., "Self-Consciousness", "Activity Level")
 * @returns The image filename without extension (e.g., "Self-consciousness", "Activity-level")
 */
export function getSubtraitImageName(subtraitName: string): string {
  // Map of display names to image filenames (matching the actual file names from Big5Personality_Updated)
  const nameMapping: Record<string, string> = {
    // Neuroticism
    'Anxiety': 'Anxiety',
    'Anger': 'Anger',
    'Depression': 'Depression',
    'Self-Consciousness': 'Self-consciousness',
    'Immoderation': 'Immoderation',
    'Vulnerability': 'Vulnerability',

    // Extraversion
    'Friendliness': 'Friendliness',
    'Gregariousness': 'Gregariousness',
    'Assertiveness': 'Assertiveness',
    'Activity Level': 'Activity-level',
    'Excitement Seeking': 'Excitement-seeking',
    'Cheerfulness': 'Cheerfulness',

    // Openness to Experience
    'Imagination': 'Imagination',
    'Artistic Interests': 'Artistic-Interests',
    'Emotionality': 'Emotionality',
    'Adventurousness': 'Adventurousness',
    'Intellect': 'Intellect',
    'Liberalism': 'Liberalism',

    // Agreeableness
    'Trust': 'Trust',
    'Morality': 'Morality',
    'Altruism': 'Altruism',
    'Cooperation': 'Cooperation',
    'Modesty': 'Modesty',
    'Sympathy': 'Sympathy',

    // Conscientiousness
    'Self-Efficacy': 'Self-efficacy',
    'Orderliness': 'Orderliness',
    'Dutifulness': 'Dutifulness',
    'Achievement': 'Achievement-striving',
    'Self Discipline': 'Self-discipline',
    'Cautiousness': 'Cautiousness',

    // Main traits
    'Neuroticism': 'Neuroticism',
    'Extraversion': 'Extraversion',
    'Openness to Experience': 'Openness to exp',
    'Agreeableness': 'Agreeableness',
    'Conscientiousness': 'Conscientiousness',
  };

  return nameMapping[subtraitName] || subtraitName;
}

/**
 * Gets the full image path for a subtrait.
 *
 * @param subtraitName - The display name of the subtrait
 * @returns The relative path to the image file in the public folder
 */
export function getSubtraitImagePath(subtraitName: string): string {
  const imageName = getSubtraitImageName(subtraitName);
  return `/images/big5personality/${imageName}.png`;
}

/**
 * Transforms UI format BigFiveGroup back to database JSONB format.
 * Converts { level, score } to { overallLevel, overallScore, groupName }.
 *
 * @param group - BigFiveGroup from UI
 * @returns Database JSONB format
 */
export function transformBigFiveGroupToDatabase(group: BigFiveGroup): any {
  return {
    groupName: group.name,
    overallLevel: group.level,
    overallScore: group.score,
    subtraits: group.subtraits,
  };
}
