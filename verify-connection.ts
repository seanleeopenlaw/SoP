#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function success(msg: string) { console.log(`${GREEN}✓${RESET} ${msg}`); }
function error(msg: string) { console.log(`${RED}✗${RESET} ${msg}`); }
function info(msg: string) { console.log(`${BLUE}ℹ${RESET} ${msg}`); }

async function verifyConnection() {
  console.log('\n=== Database Connection Verification ===\n');

  if (!process.env.DATABASE_URL) {
    error('DATABASE_URL is not set');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  const sanitizedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
  success(`DATABASE_URL: ${sanitizedUrl}`);

  const prisma = new PrismaClient({ log: ['error', 'warn'] });

  try {
    info('Connecting...');
    await prisma.$connect();
    success('Connected successfully');

    const count = await prisma.userProfile.count();
    success(`Found ${count} user profiles`);

    const profile = await prisma.userProfile.findFirst();
    if (profile) {
      success(`First profile: ${profile.name}`);
    }

    console.log(`\n${GREEN}All tests passed!${RESET}\n`);
  } catch (err: any) {
    console.log(`\n${RED}Connection FAILED${RESET}\n`);
    error(`Error: ${err.message}`);
    error(`Code: ${err.code}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();
