"use client";

import { useState } from "react";
import { requestLeave, cancelLeave } from "@/app/actions/leave";

export default function LeaveManager({ user, initialRequests }) {
    const [requests, setRequests] = useState(initialRequests);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);

        // Optimistic update could go here, but we'll wait for server for simplicity
        const res = await requestLeave(user.id, formData);

        if (res.success) {
            // In a real app we might re-fetch or use the returned object if the action returned it.
            // For now, let's refresh the page to get the new data or handle it nicely.
            // Ideally the action should return the new request.
            // Let's just reload via router or simple window reload for MVP, 
            // OR simpler: we can't easily append without the ID from server.
            // Let's rely on revalidatePath in the action which updates the server component, 
            // but for client state we need to sync. 
            // Actually, revalidatePath won't update this client state until a refresh.
            // Let's just alert and reload or handle it better if I updated the action to return the request.
            // I'll update the action logic in my head: the action revalidates the path.
            // So if I use `router.refresh()` it should fetch new data.
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

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Request Time Off</h3>
                <span style={{ fontSize: '2rem' }}>🏖️</span>
            </div>

            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Start Date</label>
                        <input type="date" name="startDate" required style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>End Date</label>
                        <input type="date" name="endDate" required style={{ width: '100%' }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Reason</label>
                    <textarea name="reason" placeholder="e.g. Family vacation" required style={{ width: '100%', minHeight: '80px' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
            </form>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>Request History</h3>

            {requests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No leave requests found.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {requests.map(req => (
                        <div key={req.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
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
                                    }}>
                                        {req.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.reason}</p>
                            </div>
                            {req.status === 'PENDING' && (
                                <button
                                    onClick={() => handleCancel(req.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                    title="Cancel Request"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
