"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Hotel,
    BarChart3,
    ChefHat,
    User,
    LogOut,
    Umbrella
} from "lucide-react";

export default function Sidebar({ isOpen }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    const links = session.user.role === "MANAGER" ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Weekly Roster", href: "/roster", icon: Calendar },
        { name: "Staff Management", href: "/staff", icon: Users },
        { name: "Hotel Operations", href: "/hotel", icon: Hotel },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ] : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Schedule", href: "/my-schedule", icon: Calendar },
        { name: "Leave Requests", href: "/my-leave", icon: Umbrella },
        { name: "Profile", href: "/my-profile", icon: User },
    ];

    return (
        <aside className={`glass-card main-sidebar ${isOpen ? 'open' : ''}`} style={{ borderRight: '1px solid var(--glass-border)', boxShadow: '20px 0 40px rgba(0,0,0,0.3)' }}>
            <div style={{
                marginBottom: '3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    boxShadow: '0 8px 20px var(--accent-glow)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <ChefHat size={28} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', lineHeight: 1, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>Carrington</h2>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '700', paddingLeft: '2px' }}>Chef Roster</span>
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>System Menu</p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={isActive ? "sidebar-link-active" : ""}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.85rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                                color: isActive ? 'var(--accent-dark)' : 'var(--text-secondary)',
                                border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                                transition: 'var(--transition)',
                                fontWeight: isActive ? '600' : '500',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '15%',
                                    bottom: '15%',
                                    width: '3px',
                                    background: 'var(--accent)',
                                    borderRadius: '0 4px 4px 0',
                                    boxShadow: '0 0 15px var(--accent)'
                                }} />
                            )}
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ filter: isActive ? 'drop-shadow(0 0 8px var(--accent-glow))' : 'none' }} />
                            <span style={{ fontSize: '0.95rem' }}>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2.5rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--bg-surface-elevated), var(--bg-surface))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-light)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        <User size={18} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.name}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{session.user.role}</p>
                    </div>
                </div>
                <button
                    onClick={async () => { await signOut({ redirect: false }); window.location.href = '/login'; }}
                    className="btn logout-btn"
                    style={{
                        width: '100%',
                        background: 'rgba(225, 29, 72, 0.05)',
                        color: '#fb7185',
                        border: '1px solid rgba(225, 29, 72, 0.15)',
                        textAlign: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'var(--transition)'
                    }}
                >
                    <LogOut size={18} />
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Log Out</span>
                </button>
            </div>
        </aside>
    );
}
