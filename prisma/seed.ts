/**
 * Prisma Seed Script
 *
 * This script loads the sample data from seed-data.json into the database.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Or add to package.json:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedProfile {
  userProfile: {
    id: string;
    userId: string;
    name: string;
    team?: string;
    birthday?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
  coreValues?: {
    id: string;
    profileId: string;
    values: string[];
    createdAt: string;
    updatedAt: string;
  };
  characterStrengths?: {
    id: string;
    profileId: string;
    strengths: string[];
    createdAt: string;
    updatedAt: string;
  };
  chronotype?: {
    id: string;
    profileId: string;
    types: string[];
    primaryType?: string;
    createdAt: string;
    updatedAt: string;
  };
  bigFive?: {
    id: string;
    profileId: string;
    openness: any;
    conscientiousness: any;
    extraversion: any;
    agreeableness: any;
    neuroticism: any;
    createdAt: string;
    updatedAt: string;
  };
}

interface SeedData {
  profiles: SeedProfile[];
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Load seed data
  const seedDataPath = path.join(__dirname, '..', 'db', 'seed-data.json');
  const seedDataFile = fs.readFileSync(seedDataPath, 'utf-8');
  const seedData: SeedData = JSON.parse(seedDataFile);

  // Clear existing data (optional - comment out if you want to preserve existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.bigFiveProfile.deleteMany();
  await prisma.chronotype.deleteMany();
  await prisma.characterStrengths.deleteMany();
  await prisma.coreValues.deleteMany();
  await prisma.userProfile.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Seed profiles
  for (const profile of seedData.profiles) {
    console.log(`📝 Creating profile for ${profile.userProfile.name}...`);

    try {
      // Create user profile
      const userProfile = await prisma.userProfile.create({
        data: {
          id: profile.userProfile.id,
          userId: profile.userProfile.userId,
          name: profile.userProfile.name,
          team: profile.userProfile.team || null,
          birthday: profile.userProfile.birthday
            ? new Date(profile.userProfile.birthday)
            : null,
          avatarUrl: profile.userProfile.avatarUrl || null,
          createdAt: new Date(profile.userProfile.createdAt),
          updatedAt: new Date(profile.userProfile.updatedAt),
        },
      });
      console.log(`  ✓ User profile created`);

      // Create core values if present
      if (profile.coreValues) {
        await prisma.coreValues.create({
          data: {
            id: profile.coreValues.id,
            profileId: profile.coreValues.profileId,
            values: profile.coreValues.values,
            createdAt: new Date(profile.coreValues.createdAt),
            updatedAt: new Date(profile.coreValues.updatedAt),
          },
        });
        console.log(`  ✓ Core values created (${profile.coreValues.values.length} items)`);
      }

      // Create character strengths if present
      if (profile.characterStrengths) {
        await prisma.characterStrengths.create({
          data: {
            id: profile.characterStrengths.id,
            profileId: profile.characterStrengths.profileId,
            strengths: profile.characterStrengths.strengths,
            createdAt: new Date(profile.characterStrengths.createdAt),
            updatedAt: new Date(profile.characterStrengths.updatedAt),
          },
        });
        console.log(`  ✓ Character strengths created (${profile.characterStrengths.strengths.length} items)`);
      }

      // Create chronotype if present
      if (profile.chronotype) {
        await prisma.chronotype.create({
          data: {
            id: profile.chronotype.id,
            profileId: profile.chronotype.profileId,
            types: profile.chronotype.types as any, // Cast to enum array
            primaryType: profile.chronotype.primaryType as any || null,
            createdAt: new Date(profile.chronotype.createdAt),
            updatedAt: new Date(profile.chronotype.updatedAt),
          },
        });
        console.log(`  ✓ Chronotype created (${profile.chronotype.types.join(', ')})`);
      }

      // Create Big Five profile if present
      if (profile.bigFive) {
        await prisma.bigFiveProfile.create({
          data: {
            id: profile.bigFive.id,
            profileId: profile.bigFive.profileId,
            opennessData: profile.bigFive.openness,
            conscientiousnessData: profile.bigFive.conscientiousness,
            extraversionData: profile.bigFive.extraversion,
            agreeablenessData: profile.bigFive.agreeableness,
            neuroticismData: profile.bigFive.neuroticism,
            createdAt: new Date(profile.bigFive.createdAt),
            updatedAt: new Date(profile.bigFive.updatedAt),
          },
        });
        console.log(`  ✓ Big Five profile created`);
      }

      console.log(`✅ ${profile.userProfile.name} profile completed\n`);
    } catch (error) {
      console.error(`❌ Error creating profile for ${profile.userProfile.name}:`, error);
      throw error;
    }
  }

  // Summary
  const profileCount = await prisma.userProfile.count();
  const coreValuesCount = await prisma.coreValues.count();
  const characterStrengthsCount = await prisma.characterStrengths.count();
  const chronotypeCount = await prisma.chronotype.count();
  const bigFiveCount = await prisma.bigFiveProfile.count();

  console.log('📊 Seeding Summary:');
  console.log(`  • User Profiles: ${profileCount}`);
  console.log(`  • Core Values: ${coreValuesCount}`);
  console.log(`  • Character Strengths: ${characterStrengthsCount}`);
  console.log(`  • Chronotypes: ${chronotypeCount}`);
  console.log(`  • Big Five Profiles: ${bigFiveCount}`);
  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
