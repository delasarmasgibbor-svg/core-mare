import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ShiftSwapManager from "@/components/ShiftSwapManager";

export const dynamic = 'force-dynamic';
import CulinaryTrivia from "@/components/CulinaryTrivia";
import ChefInspiration from "@/components/ChefInspiration";
import { Calendar, Hotel, Users, CalendarCheck } from "lucide-react";

export default async function MySchedulePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Fetch user's assigned shifts from DB
    const shifts = await prisma.shift.findMany({
        where: {
            userId: session.user.id,
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)) // From today onwards
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    // Fetch REAL Hotel Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get Live Occupancy
    const occupancy = await prisma.hotelOccupancy.findUnique({
        where: { id: "live-occupancy" }
    });

    // 2. Get Today's Reservations
    const reservations = await prisma.reservation.findMany({
        where: {
            date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }
    });

    // 3. Summarize Data
    const totalGuests = occupancy?.currentGuests || 0;
    const totalBookings = reservations.length;
    const bookingNotes = reservations.map(r =>
        r.type === "FUNCTION"
            ? `🎉 ${r.eventName} (${r.guestCount}pax)`
            : `• ${r.guestCount}pax ${r.session ? `(${r.session})` : ''}`
    ).slice(0, 3); // Top 3 items

    const briefingText = bookingNotes.length > 0
        ? bookingNotes.join(". ") + (reservations.length > 3 ? ` +${reservations.length - 3} more.` : "")
        : "No specific bookings or functions scheduled for today.";

    return (
        <div className="animate-fade">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Schedule</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '0.02em' }}>Welcome back, <span style={{ color: 'var(--accent-light)', fontWeight: '600' }}>{session?.user?.name || 'Chef'}</span>. Here is your upcoming schedule.</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', gap: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>Current Week</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
                {/* Main Schedule Column */}
                <div className="glass-card" style={{ gridColumn: 'span 8', padding: '2.5rem', '@media (max-width: 1024px)': { gridColumn: 'span 12' } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Calendar size={24} color="var(--accent-light)" /> Upcoming Shifts
                        </h3>
                        <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}>Sync to Calendar</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {shifts.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                No upcoming shifts assigned.
                            </div>
                        ) : (
                            shifts.map((shift, i) => (
                                <div key={shift.id} style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    transition: 'var(--transition)',
                                    cursor: 'default'
                                }}>
                                    <div style={{
                                        minWidth: '70px',
                                        height: '70px',
                                        background: 'linear-gradient(135deg, var(--bg-surface-elevated), var(--bg-dark))',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    }}>
                                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.1em' }}>
                                            {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                            {new Date(shift.date).getDate()}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontWeight: '700',
                                                color: shift.type === 'MORNING' ? 'var(--morning)' : shift.type === 'LUNCH' ? 'var(--lunch)' : 'var(--pm)',
                                                fontSize: '1.1rem'
                                            }}>{shift.type}</span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                            {shift.notes || "No notes"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(180deg, rgba(20,20,30,0.6) 0%, rgba(20,20,30,0.8) 100%)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Hotel size={20} color="var(--accent-light)" /> Daily Briefing</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{totalGuests}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.1em', marginTop: '0.5rem' }}>GUESTS</p>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-light)', lineHeight: 1 }}>{totalBookings}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.1em', marginTop: '0.5rem' }}>BOOKINGS</p>
                            </div>
                        </div>
                        <div style={{ padding: '1.25rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--accent-light)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Today's Note</p>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                {briefingText}
                            </p>
                        </div>
                    </div>

                    <ShiftSwapManager shifts={shifts} user={session.user} />

                    <div style={{ marginTop: '1rem' }}>
                        <CulinaryTrivia />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <ChefInspiration />
                    </div>
                </div>
            </div>
        </div>
    );
}
