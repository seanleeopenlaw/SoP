import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized Prisma Client configuration for Supabase Session Pooler
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool configuration optimized for Supabase
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Prevent hot reload from creating new Prisma Client instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
