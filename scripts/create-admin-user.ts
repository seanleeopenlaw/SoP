import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const crypto = require('crypto');
    const userId = crypto.randomUUID();

    const admin = await prisma.userProfile.upsert({
      where: { email: 'admin@openlaw.com.au' },
      create: {
        userId,
        email: 'admin@openlaw.com.au',
        name: 'Admin User',
        team: 'Administration',
      },
      update: {
        name: 'Admin User',
        team: 'Administration',
      },
    });

    console.log('✅ Admin user created/updated:', admin);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
