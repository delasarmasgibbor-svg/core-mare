"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar({ isOpen }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    const links = session.user.role === "MANAGER" ? [
        { name: "Dashboard", href: "/dashboard", icon: "📊" },
        { name: "Weekly Roster", href: "/roster", icon: "📅" },
        { name: "Staff Management", href: "/staff", icon: "👨‍🍳" },
        { name: "Hotel Operations", href: "/hotel", icon: "🏨" },
        { name: "Analytics", href: "/analytics", icon: "📈" },
    ] : [
        { name: "Dashboard", href: "/dashboard", icon: "📊" },
        { name: "My Schedule", href: "/my-schedule", icon: "📅" },
        { name: "Leave Requests", href: "/my-leave", icon: "🏖️" },
        { name: "Profile", href: "/my-profile", icon: "👤" },
    ];

    return (
        <aside className={`glass-card main-sidebar ${isOpen ? 'open' : ''}`}>
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
                    fontSize: '1.5rem',
                    boxShadow: '0 8px 20px var(--accent-glow)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>⚜️</div>
                <div>
                    <h2 style={{ fontSize: '1.4rem', color: 'white', lineHeight: 1, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>Carrington</h2>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '700', paddingLeft: '2px' }}>Chef Roster</span>
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>System Menu</p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
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
                                background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                                color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                                border: isActive ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid transparent',
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
                                    top: '20%',
                                    bottom: '20%',
                                    width: '3px',
                                    background: 'var(--accent)',
                                    borderRadius: '0 4px 4px 0',
                                    boxShadow: '0 0 10px var(--accent)'
                                }} />
                            )}
                            <span style={{ fontSize: '1.2rem', filter: isActive ? 'none' : 'grayscale(1) opacity(0.5)' }}>{link.icon}</span>
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
                        background: 'var(--bg-surface-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: 'var(--accent-light)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {session.user.name[0].toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white', lineHeight: 1.2 }}>{session.user.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{session.user.role}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="btn logout-btn"
                    style={{
                        width: '100%',
                        background: 'rgba(225, 29, 72, 0.05)',
                        color: '#fb7185',
                        border: '1px solid rgba(225, 29, 72, 0.1)',
                        textAlign: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'var(--transition)'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>🚪</span>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Log Out</span>
                </button>
            </div>
        </aside>
    );
}
