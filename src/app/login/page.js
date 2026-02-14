"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChefHat, Mail, Lock, LogIn, Loader2, Shield } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="animate-fade" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, var(--accent-glow), transparent), radial-gradient(circle at bottom left, var(--bg-dark), var(--bg-dark))',
            padding: '1.5rem'
        }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 30px var(--accent-glow)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <ChefHat size={32} color="white" />
                    </div>
                </div>
                <h1 style={{ marginBottom: '0.75rem', textAlign: 'center', fontSize: '2.25rem', color: 'white' }}>ChefOps.</h1>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem', fontWeight: '500', letterSpacing: '0.05em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Professional Kitchen Management
                </p>

                {error && (
                    <div className="animate-fade" style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        color: '#f43f5e',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><Mail size={12} /> Corporate Identity</label>
                        <input
                            type="email"
                            placeholder="e.g. g.ramsay@hotel.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><Lock size={12} /> Secure Access Key</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                        {loading ? "Authenticating..." : "Initiate Session"}
                    </button>
                </form>

                <div style={{
                    marginTop: '2.5rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--glass-border)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Shield size={12} /> Development Credentials</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--accent-light)' }}>Manager Node</p>
                            <p>manager@hotel.com</p>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--chef-2)' }}>Staff Node</p>
                            <p>chef1@hotel.com</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.75rem', color: 'var(--text-muted)' }}>Security Key: <span style={{ color: 'white' }}>password123</span></p>
                </div>
            </div>
        </div>
    );
}
