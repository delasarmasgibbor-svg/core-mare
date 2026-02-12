"use client";

import { useState } from "react";
import { requestSwap } from "@/app/actions/shift";

export default function ShiftSwapManager({ shifts, user }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSwapRequest = async (shiftId) => {
        if (!confirm("Post this shift for swapping?")) return;

        setIsSubmitting(true);
        const res = await requestSwap(shiftId, user.id);

        if (res.success) {
            alert("Swap request posted!");
            // Ideally refresh or update local state to show "Pending Swap"
            // For now, simpler verification
            window.location.reload();
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="glass-card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(0,0,0,0))',
            border: '1px solid rgba(79, 70, 229, 0.2)'
        }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Need a Swap?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Select a shift from your list to request a swap.
            </p>
            {shifts.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {shifts.map(shift => (
                        // Only show future shifts
                        new Date(shift.date) > new Date() && (
                            <button
                                key={shift.id}
                                onClick={() => handleSwapRequest(shift.id)}
                                disabled={isSubmitting}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                            >
                                🔄 {new Date(shift.date).toLocaleDateString()} ({shift.type})
                            </button>
                        )
                    ))}
                </div>
            ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No upcoming shifts to swap.</p>
            )}
        </div>
    );
}
