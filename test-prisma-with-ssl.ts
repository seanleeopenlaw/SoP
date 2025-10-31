import { PrismaClient } from '@prisma/client';

async function testWithConnectionString(url: string, description: string) {
  console.log(`\n=== ${description} ===`);
  console.log(`URL: ${url.replace(/:[^:@]+@/, ':***@')}`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: ['error'],
  });

  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log('✓ SUCCESS:', result);

    const count = await prisma.userProfile.count();
    console.log(`✓ User profiles: ${count}`);

    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.error('✗ FAILED:', error.message);
    console.error('   Code:', error.code || 'N/A');
    await prisma.$disconnect();
    return false;
  }
}

async function runTests() {
  const base = 'postgresql://postgres.rcaitnenussgesnxlimp:PeopleProject2025%21@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

  const tests = [
    {
      url: `${base}?pgbouncer=true`,
      description: 'Current .env (pgbouncer=true only)',
    },
    {
      url: `${base}?pgbouncer=true&sslmode=require`,
      description: 'With sslmode=require',
    },
    {
      url: `${base}?pgbouncer=true&ssl=true`,
      description: 'With ssl=true',
    },
    {
      url: `${base}?pgbouncer=true&sslmode=require&sslaccept=accept_invalid_certs`,
      description: 'With SSL and accept invalid certs',
    },
    {
      url: `${base}?sslmode=require`,
      description: 'Without pgbouncer, with SSL',
    },
  ];

  let successCount = 0;
  let workingUrl = '';

  for (const test of tests) {
    const success = await testWithConnectionString(test.url, test.description);
    if (success) {
      successCount++;
      if (!workingUrl) workingUrl = test.url;
    }
  }

  console.log(`\n\n=== RESULTS ===`);
  console.log(`Successful: ${successCount}/${tests.length}`);

  if (workingUrl) {
    console.log('\n✅ Working connection string found:');
    console.log(workingUrl);
  } else {
    console.log('\n❌ No working configuration found');
  }
}

runTests();
