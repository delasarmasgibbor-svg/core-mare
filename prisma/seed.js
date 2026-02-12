const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10)

    // 1. Create Manager (ONLY)
    await prisma.user.upsert({
        where: { email: 'manager@hotel.com' },
        update: {},
        create: {
            email: 'manager@hotel.com',
            name: 'Executive Manager',
            password: passwordHash,
            role: 'MANAGER',
            employmentType: 'FULL_TIME',
        },
    })

    // NO EXTRA CHEFS CREATED HERE
    // You can add real staff via the Staff page in the app.


    console.log('Seed completed successfully (Manager Only).')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
