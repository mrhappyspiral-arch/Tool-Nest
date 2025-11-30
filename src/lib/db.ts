import { PrismaClient } from '@prisma/client';

/**
 * Prisma クライアント（本番ではシングルトン）
 *
 * - Vercel などのサーバーレス環境でも安全に再利用できるよう、
 *   `globalThis` にキャッシュしておく。
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
