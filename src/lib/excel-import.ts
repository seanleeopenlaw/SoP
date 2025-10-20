import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import type { ExcelRow, ImportResult, Subtrait } from './excel/types';
import {
  parseBirthday,
  parseScore,
  parseChronotypes,
} from './excel/parsers';
import {
  normalizeBigFiveLevel,
  createBigFiveData,
  buildBigFiveSubtraits,
} from './excel/big-five-processor';

// Re-export types for backward compatibility
export type { ExcelRow, ImportResult } from './excel/types';

export async function parseExcelFile(fileBuffer: Buffer): Promise<ExcelRow[]> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
  return data;
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

  // Goals feature removed - not in current schema
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

      // Process related data for each new profile (batch with Promise.allSettled)
      const createPromises = toCreate.map(async (validatedRow) => {
        const profileId = newProfileMap.get(validatedRow.email);
        if (!profileId) {
          throw new Error('Failed to retrieve created profile');
        }

        // Process related data using the helper function
        await updateExistingUser(
          prisma,
          profileId,
          validatedRow.row,
          validatedRow.email,
          validatedRow.name
        );

        return validatedRow;
      });

      const createResults = await Promise.allSettled(createPromises);

      for (let i = 0; i < createResults.length; i++) {
        const createResult = createResults[i];
        const validatedRow = toCreate[i];

        if (createResult.status === 'fulfilled') {
          result.successCount++;
          result.details.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            action: 'created',
          });
        } else {
          result.errorCount++;
          result.errors.push({
            row: validatedRow.rowNumber,
            email: validatedRow.email,
            name: validatedRow.name,
            error: createResult.reason instanceof Error ? createResult.reason.message : 'Unknown error',
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

  // Step 5: Process updates (batch with Promise.allSettled for parallel execution)
  const updatePromises = toUpdate.map(async (validatedRow) => {
    const profileId = existingEmailMap.get(validatedRow.email);
    if (!profileId) {
      throw new Error('Profile not found');
    }

    await updateExistingUser(
      prisma,
      profileId,
      validatedRow.row,
      validatedRow.email,
      validatedRow.name
    );

    return validatedRow;
  });

  const updateResults = await Promise.allSettled(updatePromises);

  for (let i = 0; i < updateResults.length; i++) {
    const updateResult = updateResults[i];
    const validatedRow = toUpdate[i];

    if (updateResult.status === 'fulfilled') {
      result.successCount++;
      result.details.push({
        row: validatedRow.rowNumber,
        email: validatedRow.email,
        name: validatedRow.name,
        action: 'updated',
      });
    } else {
      result.errorCount++;
      result.errors.push({
        row: validatedRow.rowNumber,
        email: validatedRow.email,
        name: validatedRow.name,
        error: updateResult.reason instanceof Error ? updateResult.reason.message : 'Unknown error',
      });
    }
  }

  result.success = result.errorCount === 0;
  return result;
}
