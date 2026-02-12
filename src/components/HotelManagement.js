"use client";

import { useState, useEffect } from "react";
import { updateHotelOccupancy, addReservation, deleteReservation, clearReservations } from "@/app/actions/hotel";

export default function HotelManagement({ initialOccupancy, initialReservations }) {
    const [guests, setGuests] = useState(initialOccupancy?.currentGuests || 0);
    const [capacity, setCapacity] = useState(initialOccupancy?.capacity || 100);
    const [reservations, setReservations] = useState(initialReservations || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [resType, setResType] = useState("STANDARD");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateOccupancy = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const res = await updateHotelOccupancy(formData);
        if (!res.success) alert(res.error);
        else alert("Occupancy updated successfully!");
    };

    const handleAddReservation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const res = await addReservation(formData);

        if (res.success) {
            setReservations(prev => [...prev, res.reservation]);
            setShowAddForm(false);
            e.target.reset();
            setResType("STANDARD");
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const handleDeleteReservation = async (id) => {
        if (confirm("Are you sure you want to delete this?")) {
            const res = await deleteReservation(id);
            if (res.success) {
                setReservations(prev => prev.filter(r => r.id !== id));
            } else {
                alert(res.error);
            }
        }
    };

    const handleClearAll = async () => {
        if (confirm("WARNING: This will delete ALL future reservations and functions. This cannot be undone. Proceed?")) {
            setIsSubmitting(true);
            const res = await clearReservations();
            if (res.success) {
                setReservations([]);
                alert("All reservations cleared.");
            } else {
                alert(res.error);
            }
            setIsSubmitting(false);
        }
    };

    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);

    const isDateBooked = (day) => {
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
        const bookings = reservations.filter(r => new Date(r.date).toDateString() === checkDate);
        return bookings.length > 0 ? bookings : null;
    };

    return (
        <div className="animate-fade" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '2.5rem'
        }}>

            {/* SECTION 1: LIVE OCCUPANCY */}
            <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--accent), var(--accent-light))' }}></div>
                <form onSubmit={handleUpdateOccupancy}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Current Occupancy</h3>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-light)', padding: '6px 12px', borderRadius: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>LIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Guests In-House</label>
                                <input
                                    name="guests"
                                    type="number"
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                                    style={{
                                        lineHeight: 1.2,
                                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                                        fontWeight: '700',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--glass-border)',
                                        padding: '0.5rem 0',
                                        borderRadius: 0,
                                        color: 'white'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Total Capacity</label>
                                <input
                                    name="capacity"
                                    type="number"
                                    value={capacity}
                                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                                    style={{
                                        lineHeight: 1.2,
                                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                                        fontWeight: '300',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--glass-border)',
                                        padding: '0.5rem 0',
                                        borderRadius: 0,
                                        color: 'var(--text-secondary)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Occupancy Rate</span>
                                <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'white' }}>{capacity > 0 ? Math.round((guests / capacity) * 100) : 0}%</span>
                            </div>
                            <div style={{
                                height: '12px',
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{
                                    width: `${Math.min(100, (capacity > 0 ? (guests / capacity) * 100 : 0))}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 0 20px var(--accent-glow)'
                                }} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Update Guest Count</button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: FUTURE BOOKINGS */}
            <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--chef-2), var(--chef-1))' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Upcoming Bookings</h3>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-secondary" onClick={() => setShowCalendar(true)} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            📅 View Calendar
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            {showAddForm ? "Cancel" : "Add Booking"}
                        </button>
                        {reservations.length > 0 && (
                            <button className="btn btn-secondary" onClick={handleClearAll} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', color: 'var(--chef-1)' }}>
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* CALENDAR MODAL */}
                {showCalendar && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }} onClick={() => setShowCalendar(false)}>
                        <div className="glass-card animate-fade" style={{ width: 'min(400px, 90vw)', padding: '2rem', border: '1px solid var(--accent)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>◀</button>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>▶</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ color: 'var(--text-muted)' }}>{d}</div>)}
                                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: days }).map((_, i) => {
                                    const bookings = isDateBooked(i + 1);
                                    return (
                                        <div key={i + 1} style={{
                                            padding: '0.5rem',
                                            borderRadius: '50%',
                                            background: bookings ? 'var(--accent)' : 'transparent',
                                            color: bookings ? 'white' : 'var(--text-secondary)',
                                            fontWeight: bookings ? '700' : '400',
                                            cursor: bookings ? 'pointer' : 'default',
                                            position: 'relative'
                                        }} title={bookings ? `${bookings.length} bookings` : ''}>
                                            {i + 1}
                                            {bookings && <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}></div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowCalendar(false)}>Close</button>
                        </div>
                    </div>
                )}

                {showAddForm && (
                    <form onSubmit={handleAddReservation} className="animate-fade" style={{
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        marginBottom: '2.5rem',
                        border: '1px solid var(--accent)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label>Date</label>
                                <input name="date" type="date" required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Session</label>
                                <select name="session" defaultValue="DINNER">
                                    <option value="BREAKFAST">🍳 Breakfast</option>
                                    <option value="LUNCH">🍽️ Lunch</option>
                                    <option value="DINNER">🍷 Dinner</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label>Category</label>
                                <select name="type" value={resType} onChange={(e) => setResType(e.target.value)}>
                                    <option value="STANDARD">🏢 Standard Reservation</option>
                                    <option value="FUNCTION">🎉 Event / Function</option>
                                </select>
                            </div>
                        </div>

                        {resType === "FUNCTION" && (
                            <div>
                                <label>Event Name</label>
                                <input name="eventName" required placeholder="e.g. VIP Corporate Gala" />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label>Number of Guests</label>
                                <input name="count" type="number" required placeholder="0" />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label>Notes</label>
                                <input name="notes" placeholder="e.g. Dietary requirements..." />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
                            {isSubmitting ? "Saving..." : "Save Booking"}
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reservations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.1 }}>🗓️</div>
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending future bookings will appear here.</p>
                        </div>
                    ) : reservations.sort((a, b) => new Date(a.date) - new Date(b.date)).map((res) => (
                        <div key={res.id} className="animate-fade" style={{
                            padding: '1.5rem',
                            background: res.type === "FUNCTION" ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.02)',
                            borderRadius: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: res.type === "FUNCTION" ? '1px solid var(--accent-light)' : '1px solid var(--glass-border)',
                            transition: 'var(--transition)'
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-light)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = res.type === "FUNCTION" ? 'var(--accent-light)' : 'var(--glass-border)'}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{new Date(res.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                    <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: '700', lineHeight: 1 }}>{new Date(res.date).getDate()}</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>{res.eventName || "Standard Booking"}</p>
                                        {res.type === "FUNCTION" && (
                                            <span style={{ fontSize: '0.6rem', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', letterSpacing: '0.05em' }}>FUNCTION</span>
                                        )}
                                        {res.session && (
                                            <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{res.session}</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{res.notes || "No additional notes provided."}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>{res.guestCount}</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>GUESTS</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteReservation(res.id)}
                                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', fontSize: '0.8rem' }}
                                >🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
