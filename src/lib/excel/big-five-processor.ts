import type { ExcelRow, Subtrait } from './types';
import { fuzzyMatch } from './fuzzy-match';
import { parseScore } from './parsers';

// Helper function to normalize Big Five levels (case-insensitive with fuzzy matching)
// Accepts both "Average" and "Neutral" as "Average"
// Also handles common typos like "Hgh" -> "High", "Llow" -> "Low"
export function normalizeBigFiveLevel(level?: string | number | any): 'High' | 'Average' | 'Low' | undefined {
  if (!level) return undefined;

  // Reject numbers and booleans - these are data quality issues
  if (typeof level === 'number') {
    throw new Error(`Invalid level value: "${level}". Expected "High", "Average", or "Low", not a number.`);
  }
  if (typeof level === 'boolean') {
    throw new Error(`Invalid level value: "${level}". Expected "High", "Average", or "Low", not a boolean.`);
  }

  // Only accept strings
  if (typeof level !== 'string') {
    throw new Error(`Invalid level type: ${typeof level}. Expected string value "High", "Average", or "Low".`);
  }

  const normalized = level.toLowerCase().trim();

  // Handle "Neutral" as "Average"
  if (normalized === 'neutral') return 'Average';

  // Try exact match first
  if (normalized === 'high') return 'High';
  if (normalized === 'average') return 'Average';
  if (normalized === 'low') return 'Low';

  // Use fuzzy matching for typos
  const match = fuzzyMatch(level, ['High', 'Average', 'Low']);
  return match as 'High' | 'Average' | 'Low' | undefined;
}

// Helper function to create Big Five data structure
export function createBigFiveData(
  name: string,
  level: 'High' | 'Average' | 'Low' | undefined,
  score: number | undefined,
  subtraits: Subtrait[] = []
) {
  // Convert level to numeric score for overallScore (for backwards compatibility)
  const levelToScore: Record<string, number> = {
    High: 75,
    Average: 50,
    Low: 25,
  };

  return {
    groupName: name,
    overallLevel: level || 'Average',
    overallScore: score || (level ? levelToScore[level] : 50),
    subtraits: subtraits,
  };
}

// Helper function to build Big Five subtraits from a row
export function buildBigFiveSubtraits(row: ExcelRow) {
  // Support both old "Openness" and new "OpennessToExperience" column names
  const opennessSubtraits: Subtrait[] = [];
  const level1 = normalizeBigFiveLevel(row.BigFive_OpennessToExperience_Imagination_Level || row.BigFive_Openness_Imagination_Level);
  if (level1) opennessSubtraits.push({ name: 'Imagination', level: level1, score: parseScore(row.BigFive_OpennessToExperience_Imagination_Score || row.BigFive_Openness_Imagination_Score) });
  const level2 = normalizeBigFiveLevel(row.BigFive_OpennessToExperience_ArtisticInterests_Level || row.BigFive_Openness_ArtisticInterests_Level);
  if (level2) opennessSubtraits.push({ name: 'Artistic Interests', level: level2, score: parseScore(row.BigFive_OpennessToExperience_ArtisticInterests_Score || row.BigFive_Openness_ArtisticInterests_Score) });
  const level3 = normalizeBigFiveLevel(row.BigFive_OpennessToExperience_Emotionality_Level || row.BigFive_Openness_Emotionality_Level);
  if (level3) opennessSubtraits.push({ name: 'Emotionality', level: level3, score: parseScore(row.BigFive_OpennessToExperience_Emotionality_Score || row.BigFive_Openness_Emotionality_Score) });
  const level4 = normalizeBigFiveLevel(row.BigFive_OpennessToExperience_Adventurousness_Level || row.BigFive_Openness_Adventurousness_Level);
  if (level4) opennessSubtraits.push({ name: 'Adventurousness', level: level4, score: parseScore(row.BigFive_OpennessToExperience_Adventurousness_Score || row.BigFive_Openness_Adventurousness_Score) });
  const level5 = normalizeBigFiveLevel(row.BigFive_OpennessToExperience_Intellect_Level || row.BigFive_Openness_Intellect_Level);
  if (level5) opennessSubtraits.push({ name: 'Intellect', level: level5, score: parseScore(row.BigFive_OpennessToExperience_Intellect_Score || row.BigFive_Openness_Intellect_Score) });
  const level6 = normalizeBigFiveLevel(row.BigFive_OpennessToExperience_Liberalism_Level || row.BigFive_Openness_Liberalism_Level);
  if (level6) opennessSubtraits.push({ name: 'Liberalism', level: level6, score: parseScore(row.BigFive_OpennessToExperience_Liberalism_Score || row.BigFive_Openness_Liberalism_Score) });

  const conscientiousnessSubtraits: Subtrait[] = [];
  const clevel1 = normalizeBigFiveLevel(row.BigFive_Conscientiousness_SelfEfficacy_Level);
  if (clevel1) conscientiousnessSubtraits.push({ name: 'Self-Efficacy', level: clevel1, score: parseScore(row.BigFive_Conscientiousness_SelfEfficacy_Score) });
  const clevel2 = normalizeBigFiveLevel(row.BigFive_Conscientiousness_Orderliness_Level);
  if (clevel2) conscientiousnessSubtraits.push({ name: 'Orderliness', level: clevel2, score: parseScore(row.BigFive_Conscientiousness_Orderliness_Score) });
  const clevel3 = normalizeBigFiveLevel(row.BigFive_Conscientiousness_Dutifulness_Level);
  if (clevel3) conscientiousnessSubtraits.push({ name: 'Dutifulness', level: clevel3, score: parseScore(row.BigFive_Conscientiousness_Dutifulness_Score) });
  const clevel4 = normalizeBigFiveLevel(row.BigFive_Conscientiousness_Achievement_Level);
  if (clevel4) conscientiousnessSubtraits.push({ name: 'Achievement', level: clevel4, score: parseScore(row.BigFive_Conscientiousness_Achievement_Score) });
  const clevel5 = normalizeBigFiveLevel(row.BigFive_Conscientiousness_SelfDiscipline_Level);
  if (clevel5) conscientiousnessSubtraits.push({ name: 'Self Discipline', level: clevel5, score: parseScore(row.BigFive_Conscientiousness_SelfDiscipline_Score) });
  const clevel6 = normalizeBigFiveLevel(row.BigFive_Conscientiousness_Cautiousness_Level);
  if (clevel6) conscientiousnessSubtraits.push({ name: 'Cautiousness', level: clevel6, score: parseScore(row.BigFive_Conscientiousness_Cautiousness_Score) });

  const extraversionSubtraits: Subtrait[] = [];
  const elevel1 = normalizeBigFiveLevel(row.BigFive_Extraversion_Friendliness_Level);
  if (elevel1) extraversionSubtraits.push({ name: 'Friendliness', level: elevel1, score: parseScore(row.BigFive_Extraversion_Friendliness_Score) });
  const elevel2 = normalizeBigFiveLevel(row.BigFive_Extraversion_Gregariousness_Level);
  if (elevel2) extraversionSubtraits.push({ name: 'Gregariousness', level: elevel2, score: parseScore(row.BigFive_Extraversion_Gregariousness_Score) });
  const elevel3 = normalizeBigFiveLevel(row.BigFive_Extraversion_Assertiveness_Level);
  if (elevel3) extraversionSubtraits.push({ name: 'Assertiveness', level: elevel3, score: parseScore(row.BigFive_Extraversion_Assertiveness_Score) });
  const elevel4 = normalizeBigFiveLevel(row.BigFive_Extraversion_ActivityLevel_Level);
  if (elevel4) extraversionSubtraits.push({ name: 'Activity Level', level: elevel4, score: parseScore(row.BigFive_Extraversion_ActivityLevel_Score) });
  const elevel5 = normalizeBigFiveLevel(row.BigFive_Extraversion_ExcitementSeeking_Level);
  if (elevel5) extraversionSubtraits.push({ name: 'Excitement Seeking', level: elevel5, score: parseScore(row.BigFive_Extraversion_ExcitementSeeking_Score) });
  const elevel6 = normalizeBigFiveLevel(row.BigFive_Extraversion_Cheerfulness_Level);
  if (elevel6) extraversionSubtraits.push({ name: 'Cheerfulness', level: elevel6, score: parseScore(row.BigFive_Extraversion_Cheerfulness_Score) });

  const agreeablenessSubtraits: Subtrait[] = [];
  const alevel1 = normalizeBigFiveLevel(row.BigFive_Agreeableness_Trust_Level);
  if (alevel1) agreeablenessSubtraits.push({ name: 'Trust', level: alevel1, score: parseScore(row.BigFive_Agreeableness_Trust_Score) });
  const alevel2 = normalizeBigFiveLevel(row.BigFive_Agreeableness_Morality_Level);
  if (alevel2) agreeablenessSubtraits.push({ name: 'Morality', level: alevel2, score: parseScore(row.BigFive_Agreeableness_Morality_Score) });
  const alevel3 = normalizeBigFiveLevel(row.BigFive_Agreeableness_Altruism_Level);
  if (alevel3) agreeablenessSubtraits.push({ name: 'Altruism', level: alevel3, score: parseScore(row.BigFive_Agreeableness_Altruism_Score) });
  const alevel4 = normalizeBigFiveLevel(row.BigFive_Agreeableness_Cooperation_Level);
  if (alevel4) agreeablenessSubtraits.push({ name: 'Cooperation', level: alevel4, score: parseScore(row.BigFive_Agreeableness_Cooperation_Score) });
  const alevel5 = normalizeBigFiveLevel(row.BigFive_Agreeableness_Modesty_Level);
  if (alevel5) agreeablenessSubtraits.push({ name: 'Modesty', level: alevel5, score: parseScore(row.BigFive_Agreeableness_Modesty_Score) });
  const alevel6 = normalizeBigFiveLevel(row.BigFive_Agreeableness_Sympathy_Level);
  if (alevel6) agreeablenessSubtraits.push({ name: 'Sympathy', level: alevel6, score: parseScore(row.BigFive_Agreeableness_Sympathy_Score) });

  const neuroticismSubtraits: Subtrait[] = [];
  const nlevel1 = normalizeBigFiveLevel(row.BigFive_Neuroticism_Anxiety_Level);
  if (nlevel1) neuroticismSubtraits.push({ name: 'Anxiety', level: nlevel1, score: parseScore(row.BigFive_Neuroticism_Anxiety_Score) });
  const nlevel2 = normalizeBigFiveLevel(row.BigFive_Neuroticism_Anger_Level);
  if (nlevel2) neuroticismSubtraits.push({ name: 'Anger', level: nlevel2, score: parseScore(row.BigFive_Neuroticism_Anger_Score) });
  const nlevel3 = normalizeBigFiveLevel(row.BigFive_Neuroticism_Depression_Level);
  if (nlevel3) neuroticismSubtraits.push({ name: 'Depression', level: nlevel3, score: parseScore(row.BigFive_Neuroticism_Depression_Score) });
  const nlevel4 = normalizeBigFiveLevel(row.BigFive_Neuroticism_SelfConsciousness_Level);
  if (nlevel4) neuroticismSubtraits.push({ name: 'Self-Consciousness', level: nlevel4, score: parseScore(row.BigFive_Neuroticism_SelfConsciousness_Score) });
  const nlevel5 = normalizeBigFiveLevel(row.BigFive_Neuroticism_Immoderation_Level);
  if (nlevel5) neuroticismSubtraits.push({ name: 'Immoderation', level: nlevel5, score: parseScore(row.BigFive_Neuroticism_Immoderation_Score) });
  const nlevel6 = normalizeBigFiveLevel(row.BigFive_Neuroticism_Vulnerability_Level);
  if (nlevel6) neuroticismSubtraits.push({ name: 'Vulnerability', level: nlevel6, score: parseScore(row.BigFive_Neuroticism_Vulnerability_Score) });

  return {
    opennessSubtraits,
    conscientiousnessSubtraits,
    extraversionSubtraits,
    agreeablenessSubtraits,
    neuroticismSubtraits,
  };
}
