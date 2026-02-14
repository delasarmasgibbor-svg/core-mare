import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { createAnnouncement } from "../actions/announcements";

export const dynamic = 'force-dynamic';
import ProfileSettings from "@/components/ProfileSettings";
import ChefInspiration from "@/components/ChefInspiration";
import CulinaryTrivia from "@/components/CulinaryTrivia";
import { Users, ChefHat, Megaphone, Newspaper, Activity, Bell } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { user } = session;

    // Get today's start and end for queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Parallel Fetch stats
    const [occupancy, reservationsAgg, activeStaffCount, announcements] = await Promise.all([
        prisma.hotelOccupancy.findFirst({
            where: {
                date: { gte: today, lt: tomorrow }
            },
            orderBy: { date: 'desc' }
        }),
        prisma.reservation.aggregate({
            where: {
                date: { gte: today, lt: tomorrow }
            },
            _sum: { guestCount: true }
        }),
        prisma.shift.count({
            where: {
                date: { gte: today, lt: tomorrow }
            }
        }),
        prisma.announcement.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } } }
        })
    ]);

    const totalGuests = (occupancy?.currentGuests || 0) + (reservationsAgg._sum.guestCount || 0);

    const hour = today.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="animate-fade-in">
            <header style={{
                marginBottom: '4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <p style={{
                        color: 'var(--accent-light)',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '0.75rem'
                    }}>Executive Overview</p>
                    <h1 style={{ marginBottom: '0.5rem', color: 'white', fontSize: '3rem', letterSpacing: '-0.03em' }}>
                        {greeting}, <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>Chef</span> {user.name.split(' ')[0]}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Here is the operational status for <span style={{ color: 'white' }}>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>.</p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1rem 1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                        <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid #10b981', opacity: 0.3, animation: 'pulse 2s infinite' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white' }}>
                        System Online <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: '500' }}>• {user.role}</span>
                    </span>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem' }}>

                {/* QUICK STATS */}
                <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Operational Metrics</h3>
                        <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={14} color="var(--accent-light)" /> LIVE FEED
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>Expected Guest Census</p>
                                <p style={{ fontWeight: '800', fontSize: '2.5rem', color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>{totalGuests}</p>
                            </div>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                                <Users size={32} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>Active Kitchen Crew</p>
                                <p style={{ fontWeight: '800', fontSize: '2.5rem', color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>{activeStaffCount}</p>
                            </div>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                                <ChefHat size={32} />
                            </div>
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Occupancy Utilization</span>
                                <span style={{ fontWeight: '800', color: occupancy?.currentGuests > (occupancy?.capacity * 0.9) ? 'var(--chef-1)' : 'var(--accent-light)', fontSize: '1.1rem' }}>
                                    {occupancy?.currentGuests || 0} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>/ {occupancy?.capacity || 120} PAX</span>
                                </span>
                            </div>
                            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                <div style={{
                                    width: `${Math.min(100, (totalGuests / (occupancy?.capacity || 120)) * 100)}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                                    borderRadius: '6px',
                                    boxShadow: '0 0 20px var(--accent-glow)',
                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRIVIA GAME */}
                <CulinaryTrivia />

                {/* ANNOUNCEMENTS */}
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Team Briefings</h3>
                        <div style={{ color: 'var(--accent-light)' }}>
                            <Megaphone size={28} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {announcements.length === 0 ? (
                            <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                                <div style={{ marginBottom: '1.5rem', opacity: 0.1, display: 'flex', justifyContent: 'center' }}>
                                    <Newspaper size={48} />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '500' }}>No active briefings for the kitchen node.</p>
                            </div>
                        ) : announcements.map(note => (
                            <div key={note.id} style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.01)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)',
                                transition: 'var(--transition)'
                            }} className="announcement-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <p style={{ fontWeight: '800', color: 'white', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{note.title}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{note.body}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-surface-elevated)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        color: 'var(--accent-light)',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        {note.author.name[0].toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{note.author.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {user.role === "MANAGER" && (
                        <form action={async (formData) => {
                            "use server";
                            await createAnnouncement(formData);
                        }} style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                            <input type="hidden" name="authorId" value={user.id} />
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bell size={14} /> Create Notice
                            </p>
                            <input name="title" placeholder="Notice Title" required style={{ marginBottom: '0.75rem' }} />
                            <textarea name="body" placeholder="Broadcast a message to the kitchen team..." required style={{ minHeight: '100px', marginBottom: '1.25rem' }} />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Announcement</button>
                        </form>
                    )}
                </div>

                {/* CHEF INSPIRATION BOARD */}
                <ChefInspiration />

                {/* PROFILE SETTINGS (Manager Only) */}
                {user.role === "MANAGER" && (
                    <ProfileSettings user={user} />
                )}
            </div>
        </div>
    );
}
