const { PrismaClient } = require('./src/lib/prisma-client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Manager
    console.log('Upserting manager...');
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
    });

    // 2. Create 6 Chefs
    const chefs = [
        { name: 'Chef Gordon', email: 'chef1@hotel.com', type: 'FULL_TIME' },
        { name: 'Chef Jamie', email: 'chef2@hotel.com', type: 'FULL_TIME' },
        { name: 'Chef Heston', email: 'chef3@hotel.com', type: 'FULL_TIME' },
        { name: 'Chef Nigella', email: 'chef4@hotel.com', type: 'FULL_TIME' },
        { name: 'Chef Marco', email: 'chef5@hotel.com', type: 'CASUAL' },
        { name: 'Chef Rene', email: 'chef6@hotel.com', type: 'CASUAL' },
    ];

    for (const chef of chefs) {
        console.log(`Upserting chef: ${chef.name}...`);
        const user = await prisma.user.upsert({
            where: { email: chef.email },
            update: {},
            create: {
                email: chef.email,
                name: chef.name,
                password: passwordHash,
                role: 'STAFF',
                employmentType: chef.type,
                maxWeeklyHours: chef.type === 'CASUAL' ? 20 : 40,
            },
        });

        // Check if availabilities already exist to avoid unique constraint errors if any
        const existingAvail = await prisma.availability.findFirst({
            where: { userId: user.id }
        });

        if (!existingAvail) {
            console.log(`Adding availabilities for ${chef.name}...`);
            // Add some default availabilities for each chef
            for (let day = 0; day < 7; day++) {
                await prisma.availability.create({
                    data: {
                        userId: user.id,
                        dayOfWeek: day,
                        shiftType: 'MORNING',
                        preferred: true
                    }
                });
                await prisma.availability.create({
                    data: {
                        userId: user.id,
                        dayOfWeek: day,
                        shiftType: 'LUNCH',
                        preferred: true
                    }
                });
                await prisma.availability.create({
                    data: {
                        userId: user.id,
                        dayOfWeek: day,
                        shiftType: 'PM',
                        preferred: true
                    }
                });
            }
        }
    }

    // 3. Create initial Hotel Occupancy data
    console.log('Creating occupancy data...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Simple check to see if data for this date exists
        const existingOcc = await prisma.hotelOccupancy.findFirst({
            where: { date }
        });

        if (!existingOcc) {
            await prisma.hotelOccupancy.create({
                data: {
                    date,
                    currentGuests: Math.floor(Math.random() * 50) + 50,
                    capacity: 120
                }
            });
            await prisma.reservation.create({
                data: {
                    date,
                    guestCount: Math.floor(Math.random() * 30) + 20,
                    notes: "Regular reservations"
                }
            });
        }
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
