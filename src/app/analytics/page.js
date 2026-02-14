import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '3rem' }}>
                <p style={{
                    color: 'var(--accent-light)',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: '0.75rem'
                }}>Performance Hub</p>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Kitchen efficiency and occupancy metrics.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { icon: TrendingUp, label: 'Efficiency Score', value: '—', color: 'var(--status-success)' },
                    { icon: PieChart, label: 'Cost Ratio', value: '—', color: 'var(--accent-light)' },
                    { icon: Activity, label: 'Staff Utilization', value: '—', color: 'var(--status-warning)' },
                ].map((metric, i) => (
                    <div key={i} className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: `${metric.color}15`,
                            border: `1px solid ${metric.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <metric.icon size={28} color={metric.color} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{metric.label}</p>
                            <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{metric.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '24px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    animation: 'glow-pulse 3s infinite'
                }}>
                    <BarChart3 size={40} color="var(--accent-light)" />
                </div>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Analytics Dashboard Coming Soon</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                    Advanced kitchen performance metrics, occupancy trends, and cost analysis will be available here.
                </p>
            </div>
        </div>
    );
}
