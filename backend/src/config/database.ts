import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn']
    : ['error'],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Base de données MySQL connectée');
  } catch (error) {
    console.error('❌ Impossible de se connecter à MySQL :', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}