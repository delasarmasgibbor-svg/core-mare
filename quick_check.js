const { PrismaClient } = require('./src/lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
    const manager = await prisma.user.findUnique({
        where: { email: 'manager@hotel.com' }
    });
    console.log('Manager exists:', !!manager);
    if (manager) console.log('Manager Email:', manager.email);

    const count = await prisma.user.count();
    console.log('Total users:', count);
}

main().finally(() => prisma.$disconnect());
