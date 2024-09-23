import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    omit: {
      user: {
        password: true,
        updatedAt: true,
        createdAt: true,
        isVerified: true,
        verifyToken: true,
        verifyTokenExpiry: true,
        forgotPasswordToken: true,
        forgotPasswordTokenExpiry: true,
      }
    }
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma