"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function MainLayout({ children }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Close sidebar on navigation
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const isLoginPage = pathname === "/login";

    if (status === "loading") {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)', background: 'var(--bg-dark)' }}>
            <div className="animate-fade">Accessing ChefOps...</div>
        </div>;
    }

    if (!session || isLoginPage) {
        return <main className="animate-fade">{children}</main>;
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Interactive Cursor Glow */}
            <div style={{
                position: 'fixed',
                top: mousePos.y - 400,
                left: mousePos.x - 400,
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'top 0.15s ease-out, left 0.15s ease-out'
            }} />

            <Sidebar isOpen={sidebarOpen} />

            {/* Mobile Top Bar */}
            <div className="mobile-only" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'rgba(7, 7, 13, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                zIndex: 900,
                alignItems: 'center',
                padding: '0 1.5rem',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 12px var(--accent-glow)' }}>⚜️</div>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem', fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>Carrington</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    {sidebarOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Backdrop for mobile sidebar */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 950,
                        animation: 'fadeIn 0.3s ease'
                    }}
                />
            )}

            {/* Wrapper for the scrollable content area */}
            <div style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width)',
                minHeight: '100vh',
                display: 'flex',
                transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 2
            }}>
                <main className="animate-fade main-content-wrapper" style={{
                    flex: 1,
                    padding: 'var(--page-padding)',
                    maxWidth: 'var(--max-content-width)',
                    margin: '0 auto',
                    width: '100%',
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
