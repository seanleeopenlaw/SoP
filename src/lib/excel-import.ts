import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface ExcelRow {
  Email: string;
  Name: string;
  Team?: string;
  Birthday?: string;
  Chronotype?: string;
  CoreValue1?: string;
  CoreValue2?: string;
  CoreValue3?: string;
  CoreValue4?: string;
  CoreValue5?: string;
  Strength1?: string;
  Strength2?: string;
  Strength3?: string;
  Strength4?: string;
  Strength5?: string;

  // Big Five - Openness (support both old "Openness" and new "OpennessToExperience" column names)
  BigFive_Openness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Score?: number;
  BigFive_Openness_Imagination_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Imagination_Score?: number;
  BigFive_Openness_ArtisticInterests_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_ArtisticInterests_Score?: number;
  BigFive_Openness_Emotionality_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Emotionality_Score?: number;
  BigFive_Openness_Adventurousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Adventurousness_Score?: number;
  BigFive_Openness_Intellect_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Intellect_Score?: number;
  BigFive_Openness_Liberalism_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Liberalism_Score?: number;

  // New column names (OpennessToExperience)
  BigFive_OpennessToExperience_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Score?: number;
  BigFive_OpennessToExperience_Imagination_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Imagination_Score?: number;
  BigFive_OpennessToExperience_ArtisticInterests_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_ArtisticInterests_Score?: number;
  BigFive_OpennessToExperience_Emotionality_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Emotionality_Score?: number;
  BigFive_OpennessToExperience_Adventurousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Adventurousness_Score?: number;
  BigFive_OpennessToExperience_Intellect_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Intellect_Score?: number;
  BigFive_OpennessToExperience_Liberalism_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Liberalism_Score?: number;

  // Big Five - Conscientiousness
  BigFive_Conscientiousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Score?: number;
  BigFive_Conscientiousness_SelfEfficacy_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_SelfEfficacy_Score?: number;
  BigFive_Conscientiousness_Orderliness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Orderliness_Score?: number;
  BigFive_Conscientiousness_Dutifulness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Dutifulness_Score?: number;
  BigFive_Conscientiousness_Achievement_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Achievement_Score?: number;
  BigFive_Conscientiousness_SelfDiscipline_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_SelfDiscipline_Score?: number;
  BigFive_Conscientiousness_Cautiousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Cautiousness_Score?: number;

  // Big Five - Extraversion
  BigFive_Extraversion_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Score?: number;
  BigFive_Extraversion_Friendliness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Friendliness_Score?: number;
  BigFive_Extraversion_Gregariousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Gregariousness_Score?: number;
  BigFive_Extraversion_Assertiveness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Assertiveness_Score?: number;
  BigFive_Extraversion_ActivityLevel_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_ActivityLevel_Score?: number;
  BigFive_Extraversion_ExcitementSeeking_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_ExcitementSeeking_Score?: number;
  BigFive_Extraversion_Cheerfulness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Cheerfulness_Score?: number;

  // Big Five - Agreeableness
  BigFive_Agreeableness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Score?: number;
  BigFive_Agreeableness_Trust_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Trust_Score?: number;
  BigFive_Agreeableness_Morality_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Morality_Score?: number;
  BigFive_Agreeableness_Altruism_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Altruism_Score?: number;
  BigFive_Agreeableness_Cooperation_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Cooperation_Score?: number;
  BigFive_Agreeableness_Modesty_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Modesty_Score?: number;
  BigFive_Agreeableness_Sympathy_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Sympathy_Score?: number;

  // Big Five - Neuroticism
  BigFive_Neuroticism_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Score?: number;
  BigFive_Neuroticism_Anxiety_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Anxiety_Score?: number;
  BigFive_Neuroticism_Anger_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Anger_Score?: number;
  BigFive_Neuroticism_Depression_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Depression_Score?: number;
  BigFive_Neuroticism_SelfConsciousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_SelfConsciousness_Score?: number;
  BigFive_Neuroticism_Immoderation_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Immoderation_Score?: number;
  BigFive_Neuroticism_Vulnerability_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Vulnerability_Score?: number;

  Goals_Period?: string;
  Goals_Professional?: string;
  Goals_Personal?: string;
}

export interface ImportResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    email?: string;
    name?: string;
    error: string;
  }>;
  details: Array<{
    row: number;
    email: string;
    name: string;
    action: 'created' | 'updated';
  }>;
}

// Helper function to convert Excel serial date to JavaScript Date
function excelSerialToDate(serial: number): Date {
  // Excel epoch starts at 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  // Excel dates > 59 (after Feb 28, 1900) are off by 1 day due to this bug
  // We need to subtract 2 from the serial: 1 for the bug, 1 for the epoch offset
  const adjustedSerial = serial > 59 ? serial - 2 : serial - 1;

  // Use UTC to avoid timezone offset issues
  const epoch = Date.UTC(1900, 0, 1); // January 1, 1900 UTC (day 1 in Excel)
  return new Date(epoch + adjustedSerial * 86400000); // 86400000 ms = 1 day
}

// Helper function to parse birthday field (string or Excel serial number)
function parseBirthday(birthday: string | number | undefined): Date | null {
  if (!birthday) return null;

  // If it's a number, it's an Excel serial date
  if (typeof birthday === 'number') {
    return excelSerialToDate(birthday);
  }

  // If it's a string, try to parse it
  const parsed = new Date(birthday);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Helper function to parse score (string or number)
function parseScore(score: string | number | undefined): number | undefined {
  if (score === undefined || score === null || score === '') return undefined;

  const parsed = typeof score === 'string' ? parseInt(score, 10) : score;
  return isNaN(parsed) ? undefined : parsed;
}

export async function parseExcelFile(fileBuffer: Buffer): Promise<ExcelRow[]> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
  return data;
}

// Helper function to parse and normalize multiple chronotypes
// Supports formats: "Lion (Bear)", "Lion, Bear", "Lion/Bear"
function parseChronotypes(chronotypeString: string): ('Lion' | 'Bear' | 'Wolf' | 'Dolphin')[] {
  if (!chronotypeString || !chronotypeString.trim()) {
    return [];
  }

  // Remove parentheses and split by commas, slashes, or spaces
  const cleaned = chronotypeString.replace(/[()]/g, ' ');
  const parts = cleaned.split(/[,/\s]+/).filter(p => p.trim());

  const validTypes: ('Lion' | 'Bear' | 'Wolf' | 'Dolphin')[] = [];
  const typeMap: Record<string, 'Lion' | 'Bear' | 'Wolf' | 'Dolphin'> = {
    lion: 'Lion',
    bear: 'Bear',
    wolf: 'Wolf',
    dolphin: 'Dolphin',
  };

  for (const part of parts) {
    const normalized = part.trim().toLowerCase();
    if (typeMap[normalized]) {
      validTypes.push(typeMap[normalized]);
    }
  }

  return validTypes;
}

// Helper function to calculate Levenshtein distance (for fuzzy matching)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Helper function to find closest match with fuzzy matching
function fuzzyMatch(input: string, options: string[]): string | undefined {
  const normalized = input.toLowerCase().trim();

  // First try exact match
  for (const option of options) {
    if (normalized === option.toLowerCase()) {
      return option;
    }
  }

  // Then try fuzzy match (allow 1-2 character difference)
  let bestMatch: string | undefined;
  let bestDistance = Infinity;

  for (const option of options) {
    const distance = levenshteinDistance(normalized, option.toLowerCase());

    // Allow typos: max distance of 2 for words, or 30% of length
    const maxAllowedDistance = Math.max(2, Math.floor(option.length * 0.3));

    if (distance < bestDistance && distance <= maxAllowedDistance) {
      bestDistance = distance;
      bestMatch = option;
    }
  }

  return bestMatch;
}

// Helper function to normalize Big Five levels (case-insensitive with fuzzy matching)
// Accepts both "Average" and "Neutral" as "Average"
// Also handles common typos like "Hgh" -> "High", "Llow" -> "Low"
function normalizeBigFiveLevel(level?: string): 'High' | 'Average' | 'Low' | undefined {
  if (!level) return undefined;

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

// Define Subtrait type
interface Subtrait {
  name: string;
  level: 'High' | 'Average' | 'Low';
  score?: number;
}

// Helper function to create Big Five data structure
function createBigFiveData(
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
function buildBigFiveSubtraits(row: ExcelRow) {
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

// Helper to process a single user's update (for existing users)
async function updateExistingUser(
  prisma: PrismaClient,
  profileId: string,
  row: ExcelRow,
  email: string,
  name: string
) {
  const parsedBirthday = parseBirthday(row.Birthday);

  // Build partial update data - only include fields that have values
  const updateData: {
    name: string;
    team?: string | null;
    birthday?: Date | null;
  } = {
    name, // Name is always required
  };

  // Only update team if provided in Excel
  if (row.Team !== undefined && row.Team !== null && row.Team.trim() !== '') {
    updateData.team = row.Team;
  }

  // Only update birthday if provided in Excel
  if (parsedBirthday !== null) {
    updateData.birthday = parsedBirthday;
  }

  // Update profile with partial data
  await prisma.userProfile.update({
    where: { email },
    data: updateData,
  });

  // Collect core values
  const coreValues = [
    row.CoreValue1,
    row.CoreValue2,
    row.CoreValue3,
    row.CoreValue4,
    row.CoreValue5,
  ].filter((v) => v && v.trim());

  // Collect character strengths
  const strengths = [
    row.Strength1,
    row.Strength2,
    row.Strength3,
    row.Strength4,
    row.Strength5,
  ].filter((s) => s && s.trim());

  // Upsert Core Values
  if (coreValues.length > 0) {
    await prisma.coreValues.upsert({
      where: { profileId },
      create: {
        profileId,
        values: coreValues as string[],
      },
      update: {
        values: coreValues as string[],
      },
    });
  }

  // Upsert Character Strengths
  if (strengths.length > 0) {
    await prisma.characterStrengths.upsert({
      where: { profileId },
      create: {
        profileId,
        strengths: strengths as string[],
      },
      update: {
        strengths: strengths as string[],
      },
    });
  }

  // Upsert Chronotype - now supports multiple types
  if (row.Chronotype) {
    const chronotypes = parseChronotypes(row.Chronotype);

    if (chronotypes.length > 0) {
      await prisma.chronotype.upsert({
        where: { profileId },
        create: {
          profileId,
          types: chronotypes,
          primaryType: chronotypes[0],
        },
        update: {
          types: chronotypes,
          primaryType: chronotypes[0],
        },
      });
    }
  }

  // Upsert Big Five Profile (check if any Big Five data exists)
  const hasBigFiveData =
    row.BigFive_Neuroticism_Level ||
    row.BigFive_Extraversion_Level ||
    row.BigFive_OpennessToExperience_Level ||
    row.BigFive_Openness_Level ||
    row.BigFive_Agreeableness_Level ||
    row.BigFive_Conscientiousness_Level;

  if (hasBigFiveData) {
    const subtraits = buildBigFiveSubtraits(row);

    const bigFiveData = {
      neuroticismData: createBigFiveData(
        'Neuroticism',
        normalizeBigFiveLevel(row.BigFive_Neuroticism_Level),
        parseScore(row.BigFive_Neuroticism_Score),
        subtraits.neuroticismSubtraits
      ) as any,
      extraversionData: createBigFiveData(
        'Extraversion',
        normalizeBigFiveLevel(row.BigFive_Extraversion_Level),
        parseScore(row.BigFive_Extraversion_Score),
        subtraits.extraversionSubtraits
      ) as any,
      opennessData: createBigFiveData(
        'Openness',
        normalizeBigFiveLevel(row.BigFive_OpennessToExperience_Level || row.BigFive_Openness_Level),
        parseScore(row.BigFive_OpennessToExperience_Score || row.BigFive_Openness_Score),
        subtraits.opennessSubtraits
      ) as any,
      agreeablenessData: createBigFiveData(
        'Agreeableness',
        normalizeBigFiveLevel(row.BigFive_Agreeableness_Level),
        parseScore(row.BigFive_Agreeableness_Score),
        subtraits.agreeablenessSubtraits
      ) as any,
      conscientiousnessData: createBigFiveData(
        'Conscientiousness',
        normalizeBigFiveLevel(row.BigFive_Conscientiousness_Level),
        parseScore(row.BigFive_Conscientiousness_Score),
        subtraits.conscientiousnessSubtraits
      ) as any,
    };

    await prisma.bigFiveProfile.upsert({
      where: { profileId },
      create: {
        profileId,
        ...bigFiveData,
      },
      update: bigFiveData,
    });
  }

  // Upsert Goals
  if (row.Goals_Period) {
    await prisma.goals.upsert({
      where: { profileId },
      create: {
        profileId,
        period: row.Goals_Period,
        professionalGoals: row.Goals_Professional || null,
        personalGoals: row.Goals_Personal || null,
      },
      update: {
        period: row.Goals_Period,
        professionalGoals: row.Goals_Professional || null,
        personalGoals: row.Goals_Personal || null,
      },
    });
  }
}

export async function importUsersFromExcel(
  data: ExcelRow[],
  prisma: PrismaClient,
  resetDatabase: boolean = false
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    successCount: 0,
    errorCount: 0,
    errors: [],
    details: [],
  };

  // Step 1: Validate all rows and collect valid emails
  interface ValidatedRow {
    index: number;
    rowNumber: number;
    email: string;
    name: string;
    row: ExcelRow;
  }

  const validatedRows: ValidatedRow[] = [];

  for (let index = 0; index < data.length; index++) {
    const row = data[index];
    const rowNumber = index + 2; // Excel rows start at 2 (1 is header)
    const email = row.Email?.toLowerCase().trim();
    const name = row.Name?.trim();

    if (!email || !name) {
      result.errorCount++;
      result.errors.push({
        row: rowNumber,
        email: email || '',
        name: name || '',
        error: 'Missing required fields: email or name',
      });
      continue;
    }

    validatedRows.push({ index, rowNumber, email, name, row });
  }

  if (validatedRows.length === 0) {
    result.success = result.errorCount === 0;
    return result;
  }

  // Step 2: Handle database reset if requested
  if (resetDatabase) {
    const emails = validatedRows.map((v) => v.email);

    // Delete all profiles NOT in the import file (except admin)
    const adminEmail = 'admin@openlaw.com.au'; // Admin user to preserve
    await prisma.userProfile.deleteMany({
      where: {
        AND: [
          { email: { notIn: emails } },
          { email: { not: adminEmail } },
        ],
      },
    });
  }

  // Step 3: Fetch all existing profiles in one query
  const emails = validatedRows.map((v) => v.email);
  const existingProfiles = await prisma.userProfile.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });

  const existingEmailMap = new Map(
    existingProfiles.map((p) => [p.email, p.id])
  );

  // Step 3: Split rows into creates and updates
  const toCreate: ValidatedRow[] = [];
  const toUpdate: ValidatedRow[] = [];

  for (const validatedRow of validatedRows) {
    if (existingEmailMap.has(validatedRow.email)) {
      toUpdate.push(validatedRow);
    } else {
      toCreate.push(validatedRow);
    }
  }

  // Step 4: Batch create new profiles
  if (toCreate.length > 0) {
    try {
      // Create all new user profiles at once
      await prisma.userProfile.createMany({
        data: toCreate.map((v) => ({
          userId: randomUUID(),
          email: v.email,
          name: v.name,
          team: v.row.Team || null,
          birthday: parseBirthday(v.row.Birthday),
        })),
        skipDuplicates: true,
      });

      // Fetch the newly created profiles to get their IDs
      const newProfiles = await prisma.userProfile.findMany({
        where: { email: { in: toCreate.map((v) => v.email) } },
        select: { id: true, email: true },
      });

      const newProfileMap = new Map(
        newProfiles.map((p) => [p.email, p.id])
      );

      // Process related data for each new profile
      for (const validatedRow of toCreate) {
        const profileId = newProfileMap.get(validatedRow.email);
        if (!profileId) {
          result.errorCount++;
          result.errors.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            error: 'Failed to retrieve created profile',
          });
          continue;
        }

        try {
          // Process related data using the helper function
          await updateExistingUser(
            prisma,
            profileId,
            validatedRow.row,
            validatedRow.email,
            validatedRow.name
          );

          result.successCount++;
          result.details.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            action: 'created',
          });
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      // If batch create fails, fall back to individual creates
      for (const validatedRow of toCreate) {
        try {
          const parsedBirthday = parseBirthday(validatedRow.row.Birthday);

          const created = await prisma.userProfile.create({
            data: {
              userId: randomUUID(),
              email: validatedRow.email,
              name: validatedRow.name,
              team: validatedRow.row.Team || null,
              birthday: parsedBirthday,
            },
          });

          await updateExistingUser(
            prisma,
            created.id,
            validatedRow.row,
            validatedRow.email,
            validatedRow.name
          );

          result.successCount++;
          result.details.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            action: 'created',
          });
        } catch (innerError) {
          result.errorCount++;
          result.errors.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            error: innerError instanceof Error ? innerError.message : 'Unknown error',
          });
        }
      }
    }
  }

  // Step 5: Process updates (individual transactions)
  for (const validatedRow of toUpdate) {
    try {
      const profileId = existingEmailMap.get(validatedRow.email);
      if (!profileId) {
        result.errorCount++;
        result.errors.push({
          row: validatedRow.rowNumber,
          email: validatedRow.email,
          name: validatedRow.name,
          error: 'Profile not found',
        });
        continue;
      }

      await updateExistingUser(
        prisma,
        profileId,
        validatedRow.row,
        validatedRow.email,
        validatedRow.name
      );

      result.successCount++;
      result.details.push({
        row: validatedRow.rowNumber,
        email: validatedRow.email,
        name: validatedRow.name,
        action: 'updated',
      });
    } catch (error) {
      result.errorCount++;
      result.errors.push({
        row: validatedRow.rowNumber,
        email: validatedRow.email,
        name: validatedRow.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  result.success = result.errorCount === 0;
  return result;
}
