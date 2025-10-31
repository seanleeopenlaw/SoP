import { PrismaClient } from '@prisma/client';

async function testPrismaConnection() {
  console.log('=== Testing Prisma Connection ===\n');

  // Test with environment variables
  console.log('Environment Variables:');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
  console.log(`DIRECT_URL: ${process.env.DIRECT_URL?.substring(0, 50)}...`);

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn', 'info'],
  });

  try {
    console.log('\n1. Testing database connection...');
    await prisma.$connect();
    console.log('✓ Prisma connected successfully');

    console.log('\n2. Testing raw query...');
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
    console.log('✓ Raw query successful:', result);

    console.log('\n3. Testing UserProfile query...');
    const count = await prisma.userProfile.count();
    console.log(`✓ Found ${count} user profiles`);

    console.log('\n4. Testing findFirst...');
    const firstProfile = await prisma.userProfile.findFirst({
      take: 1,
    });
    console.log(`✓ First profile: ${firstProfile ? firstProfile.name : 'No profiles found'}`);

    console.log('\n✅ All Prisma tests passed!');
    return true;
  } catch (error: any) {
    console.error('\n❌ Prisma Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);

    if (error.code === 'P1001') {
      console.error('\n→ Cannot reach database server');
      console.error('   Possible causes:');
      console.error('   - Database URL is incorrect');
      console.error('   - Network connectivity issue');
      console.error('   - Database server is down or paused');
    } else if (error.code === 'P1002') {
      console.error('\n→ Database server was reached but timed out');
      console.error('   Try increasing connection timeout');
    } else if (error.code === 'P1003') {
      console.error('\n→ Database does not exist');
    } else if (error.code === 'P1008') {
      console.error('\n→ Operations timed out');
    } else if (error.code === 'P1009') {
      console.error('\n→ Database already exists');
    } else if (error.code === 'P1010') {
      console.error('\n→ Access denied for user');
    }

    return false;
  } finally {
    await prisma.$disconnect();
    console.log('\nPrisma disconnected');
  }
}

testPrismaConnection();
