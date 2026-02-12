import { PrismaClient } from './prisma-client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

const globalForPrisma = globalThis

let prisma = globalForPrisma.prisma

if (!prisma || (prisma.user && !prisma.idea)) {
    prisma = prismaClientSingleton()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export default prisma
