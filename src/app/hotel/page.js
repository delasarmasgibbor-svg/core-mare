import prisma from "@/lib/prisma";
import HotelManagement from "@/components/HotelManagement";

export default async function HotelPage() {
    const occupancy = await prisma.hotelOccupancy.findUnique({
        where: { id: "live-occupancy" }
    });

    const reservations = await prisma.reservation.findMany({
        orderBy: { date: 'asc' }
    });

    return (
        <div style={{ padding: 'var(--page-padding)' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Hotel Status</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage live guest counts and upcoming events</p>
            </header>

            <HotelManagement
                initialOccupancy={occupancy ? JSON.parse(JSON.stringify(occupancy)) : null}
                initialReservations={JSON.parse(JSON.stringify(reservations))}
            />

            <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Planning Insights</h3>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    The total volume for the kitchen is calculated by combining <strong>In-House Guests</strong> (for immediate services like breakfast) and <strong>Reservations</strong> (for specific events/lunch/dinners). Managers should ensure staffing levels on the
                    <a href="/roster" style={{ marginLeft: '4px', textDecoration: 'underline' }}>Weekly Roster</a> match these peaks.
                </p>
            </div>
        </div>
    );
}
