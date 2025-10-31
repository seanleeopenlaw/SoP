/**
 * Transaction Timing Diagnostic Tool
 * Tests individual query performance vs transaction overhead for Supabase
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testIndividualQueries(profileId: string) {
  console.log('\n=== Testing Individual Queries (No Transaction) ===');
  const start = Date.now();

  try {
    const [profile, coreValues, strengths, chronotype, bigFive, goals] = await Promise.all([
      prisma.userProfile.update({
        where: { id: profileId },
        data: { name: 'Test User', team: 'Test Team', jobTitle: 'Test Job' },
      }),
      prisma.coreValues.upsert({
        where: { profileId },
        create: { profileId, values: ['Value1', 'Value2'] },
        update: { values: ['Value1', 'Value2'] },
      }),
      prisma.characterStrengths.upsert({
        where: { profileId },
        create: { profileId, strengths: ['Strength1'] },
        update: { strengths: ['Strength1'] },
      }),
      prisma.chronotype.upsert({
        where: { profileId },
        create: { profileId, types: ['Bear'], primaryType: 'Bear' },
        update: { types: ['Bear'], primaryType: 'Bear' },
      }),
      prisma.bigFiveProfile.upsert({
        where: { profileId },
        create: {
          profileId,
          opennessData: {},
          conscientiousnessData: {},
          extraversionData: {},
          agreeablenessData: {},
          neuroticismData: {},
        },
        update: {
          opennessData: {},
          conscientiousnessData: {},
          extraversionData: {},
          agreeablenessData: {},
          neuroticismData: {},
        },
      }),
      prisma.goals.upsert({
        where: { profileId },
        create: { profileId, period: 'Q1 2025', professionalGoals: 'Test' },
        update: { period: 'Q1 2025', professionalGoals: 'Test' },
      }),
    ]);

    const end = Date.now();
    console.log(`Duration: ${end - start}ms`);
    console.log('Status: SUCCESS');
  } catch (error) {
    const end = Date.now();
    console.log(`Duration: ${end - start}ms`);
    console.log('Status: FAILED');
    console.error('Error:', error);
  }
}

async function testTransactionQuery(profileId: string, timeout: number) {
  console.log(`\n=== Testing Transaction (timeout: ${timeout}ms) ===`);
  const start = Date.now();

  try {
    const result = await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.userProfile.update({
          where: { id: profileId },
          data: { name: 'Test User', team: 'Test Team', jobTitle: 'Test Job' },
        }),
        tx.coreValues.upsert({
          where: { profileId },
          create: { profileId, values: ['Value1', 'Value2'] },
          update: { values: ['Value1', 'Value2'] },
        }),
        tx.characterStrengths.upsert({
          where: { profileId },
          create: { profileId, strengths: ['Strength1'] },
          update: { strengths: ['Strength1'] },
        }),
        tx.chronotype.upsert({
          where: { profileId },
          create: { profileId, types: ['Bear'], primaryType: 'Bear' },
          update: { types: ['Bear'], primaryType: 'Bear' },
        }),
        tx.bigFiveProfile.upsert({
          where: { profileId },
          create: {
            profileId,
            opennessData: {},
            conscientiousnessData: {},
            extraversionData: {},
            agreeablenessData: {},
            neuroticismData: {},
          },
          update: {
            opennessData: {},
            conscientiousnessData: {},
            extraversionData: {},
            agreeablenessData: {},
            neuroticismData: {},
          },
        }),
        tx.goals.upsert({
          where: { profileId },
          create: { profileId, period: 'Q1 2025', professionalGoals: 'Test' },
          update: { period: 'Q1 2025', professionalGoals: 'Test' },
        }),
      ]);

      return tx.userProfile.findUnique({
        where: { id: profileId },
        include: {
          coreValues: true,
          characterStrengths: true,
          chronotype: true,
          bigFiveProfile: true,
          goals: true,
        },
      });
    }, {
      maxWait: timeout,
      timeout: timeout,
    });

    const end = Date.now();
    console.log(`Duration: ${end - start}ms`);
    console.log('Status: SUCCESS');
  } catch (error) {
    const end = Date.now();
    console.log(`Duration: ${end - start}ms`);
    console.log('Status: FAILED');
    console.error('Error:', error);
  }
}

async function runDiagnostics() {
  console.log('===================================');
  console.log('PRISMA TRANSACTION TIMING DIAGNOSTIC');
  console.log('===================================');
  console.log('Environment: Supabase Transaction Pooler');
  console.log('Connection: pgbouncer=true (port 6543)');

  // Get first profile from database
  const profile = await prisma.userProfile.findFirst();

  if (!profile) {
    console.error('No profiles found in database. Please seed data first.');
    process.exit(1);
  }

  console.log(`Testing with Profile ID: ${profile.id}`);

  // Test 1: Individual queries (no transaction)
  await testIndividualQueries(profile.id);

  // Test 2: Transaction with 15s timeout (current)
  await testTransactionQuery(profile.id, 15000);

  // Test 3: Transaction with 30s timeout
  await testTransactionQuery(profile.id, 30000);

  await prisma.$disconnect();
}

runDiagnostics().catch(console.error);
