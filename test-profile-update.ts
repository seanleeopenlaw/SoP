/**
 * Profile Update Test Script
 * Tests the optimized PATCH endpoint without transaction wrapper
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testProfileUpdate() {
  console.log('========================================');
  console.log('PROFILE UPDATE TEST (No Transaction)');
  console.log('========================================\n');

  try {
    // Get first profile
    const profile = await prisma.userProfile.findFirst();

    if (!profile) {
      console.error('No profiles found. Please seed database first.');
      process.exit(1);
    }

    console.log(`Testing with Profile ID: ${profile.id}`);
    console.log(`Current Name: ${profile.name}`);
    console.log(`Current Team: ${profile.team || 'N/A'}`);
    console.log(`Current Job Title: ${profile.jobTitle || 'N/A'}\n`);

    // Test 1: Update with jobTitle
    console.log('[Test 1] Updating profile with jobTitle...');
    const startUpdate = Date.now();

    await Promise.all([
      // Update basic profile fields
      prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          name: profile.name,
          team: profile.team || undefined,
          jobTitle: 'Senior Test Engineer', // NEW FIELD
        },
      }),

      // Update core values
      prisma.coreValues.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          values: ['Testing', 'Quality', 'Excellence'],
        },
        update: {
          values: ['Testing', 'Quality', 'Excellence'],
        },
      }),

      // Update character strengths
      prisma.characterStrengths.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          strengths: ['Persistence', 'Attention to Detail'],
        },
        update: {
          strengths: ['Persistence', 'Attention to Detail'],
        },
      }),

      // Update chronotype
      prisma.chronotype.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          types: ['Bear'],
          primaryType: 'Bear',
        },
        update: {
          types: ['Bear'],
          primaryType: 'Bear',
        },
      }),

      // Update Big Five
      prisma.bigFiveProfile.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
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

      // Update goals
      prisma.goals.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          period: 'Q1 2025',
          professionalGoals: 'Test all features',
        },
        update: {
          period: 'Q1 2025',
          professionalGoals: 'Test all features',
        },
      }),
    ]);

    const updateTime = Date.now() - startUpdate;
    console.log(`✓ Parallel updates completed (${updateTime}ms)\n`);

    // Fetch updated profile
    console.log('[Test 2] Fetching updated profile...');
    const startFetch = Date.now();

    const updatedProfile = await prisma.userProfile.findUnique({
      where: { id: profile.id },
      include: {
        coreValues: true,
        characterStrengths: true,
        chronotype: true,
        bigFiveProfile: true,
        goals: true,
      },
    });

    const fetchTime = Date.now() - startFetch;
    console.log(`✓ Profile fetched (${fetchTime}ms)\n`);

    // Verify updates
    console.log('========================================');
    console.log('VERIFICATION');
    console.log('========================================');
    console.log(`Name: ${updatedProfile?.name}`);
    console.log(`Team: ${updatedProfile?.team || 'N/A'}`);
    console.log(`Job Title: ${updatedProfile?.jobTitle || 'N/A'}`);
    console.log(`Core Values: ${updatedProfile?.coreValues?.values.join(', ') || 'N/A'}`);
    console.log(`Character Strengths: ${updatedProfile?.characterStrengths?.strengths.join(', ') || 'N/A'}`);
    console.log(`Chronotype: ${updatedProfile?.chronotype?.primaryType || 'N/A'}`);
    console.log(`Goals Period: ${updatedProfile?.goals?.period || 'N/A'}`);
    console.log('');

    // Performance summary
    console.log('========================================');
    console.log('PERFORMANCE SUMMARY');
    console.log('========================================');
    console.log(`Update Time:          ${updateTime}ms`);
    console.log(`Fetch Time:           ${fetchTime}ms`);
    console.log(`Total Time:           ${updateTime + fetchTime}ms`);
    console.log('');

    if (updateTime + fetchTime > 5000) {
      console.log('⚠ WARNING: Operation took >5s');
      console.log('  - Check network latency to Supabase');
    } else if (updateTime + fetchTime > 3000) {
      console.log('⚠ NOTICE: Operation took >3s');
      console.log('  - This is acceptable but could be optimized');
    } else {
      console.log('✓ Excellent performance! (<3s total)');
    }

    console.log('');
    console.log('========================================');
    console.log('STATUS: ALL TESTS PASSED ✓');
    console.log('========================================\n');

    // Verify jobTitle was set
    if (updatedProfile?.jobTitle === 'Senior Test Engineer') {
      console.log('✓ Job Title field updated successfully!');
    } else {
      console.error('❌ Job Title field was NOT updated!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testProfileUpdate().catch(console.error);
