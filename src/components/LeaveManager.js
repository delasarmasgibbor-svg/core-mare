"use client";

import { useState } from "react";
import { requestLeave, cancelLeave } from "@/app/actions/leave";
import { Palmtree, CalendarDays, FileText, Send, Loader2, X, Clock, CheckCircle, XCircle } from "lucide-react";

export default function LeaveManager({ user, initialRequests }) {
    const [requests, setRequests] = useState(initialRequests);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);

        const res = await requestLeave(user.id, formData);

        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const handleCancel = async (id) => {
        if (!confirm("Cancel this leave request?")) return;

        setIsSubmitting(true);
        const res = await cancelLeave(id, user.id);
        if (res.success) {
            setRequests(prev => prev.filter(r => r.id !== id));
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const getStatusIcon = (status) => {
        if (status === 'APPROVED') return <CheckCircle size={14} color="#34d399" />;
        if (status === 'REJECTED') return <XCircle size={14} color="#f43f5e" />;
        return <Clock size={14} color="#fbbf24" />;
    };

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Palmtree size={22} color="var(--status-success)" />
                    </div>
                    Request Time Off
                </h3>
            </div>

            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <CalendarDays size={12} /> Start Date
                        </label>
                        <input type="date" name="startDate" required style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <CalendarDays size={12} /> End Date
                        </label>
                        <input type="date" name="endDate" required style={{ width: '100%' }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <FileText size={12} /> Reason
                    </label>
                    <textarea name="reason" placeholder="e.g. Family vacation" required style={{ width: '100%', minHeight: '80px' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
            </form>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--text-muted)" /> Request History
            </h3>

            {requests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No leave requests found.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {requests.map(req => (
                        <div key={req.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'var(--transition-fast)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: '700', color: 'white' }}>
                                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '800',
                                        background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : req.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                        color: req.status === 'APPROVED' ? '#34d399' : req.status === 'REJECTED' ? '#f43f5e' : '#fbbf24',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {getStatusIcon(req.status)}
                                        {req.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.reason}</p>
                            </div>
                            {req.status === 'PENDING' && (
                                <button
                                    onClick={() => handleCancel(req.id)}
                                    style={{
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        border: '1px solid rgba(244, 63, 94, 0.2)',
                                        color: '#fb7185',
                                        cursor: 'pointer',
                                        width: '32px', height: '32px',
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'var(--transition-fast)'
                                    }}
                                    title="Cancel Request"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
