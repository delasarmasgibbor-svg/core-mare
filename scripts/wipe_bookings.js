const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🗑️ Wiping all bookings and occupancy data...')

    try {
        const deletedOccupancy = await prisma.hotelOccupancy.deleteMany({})
        console.log(`✅ Deleted ${deletedOccupancy.count} occupancy records.`)

        const deletedReservations = await prisma.reservation.deleteMany({})
        console.log(`✅ Deleted ${deletedReservations.count} reservation records.`)

        console.log('🎉 Database is clean of bookings.')
    } catch (e) {
        console.error('❌ Error wiping data:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
