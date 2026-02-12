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

    // 3. Create initial Hotel Occupancy data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 14; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        // Check if occupancy exists first
        const existing = await prisma.hotelOccupancy.findFirst({
            where: { date }
        });

        if (!existing) {
            await prisma.hotelOccupancy.create({
                data: {
                    date,
                    currentGuests: Math.floor(Math.random() * 50) + 50,
                    capacity: 120
                }
            })
            await prisma.reservation.create({
                data: {
                    date,
                    guestCount: Math.floor(Math.random() * 30) + 20,
                    notes: "Regular reservations"
                }
            })
        }
    }

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
