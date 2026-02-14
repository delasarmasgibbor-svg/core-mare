"use client";

import { useState, useEffect } from "react";
import { updateHotelOccupancy, addReservation, deleteReservation, clearReservations } from "@/app/actions/hotel";
import {
    Users,
    Hotel,
    Calendar,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle,
    X,
    PartyPopper,
    Utensils,
    Wine,
    Coffee,
    ChevronLeft,
    ChevronRight,
    Save,
    RotateCcw
} from "lucide-react";

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
        if (confirm("WARNING: All future reservations will be deleted. Proceed?")) {
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
        <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '2.5rem'
        }}>

            {/* SECTION 1: LIVE OCCUPANCY */}
            <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }}></div>
                <form onSubmit={handleUpdateOccupancy}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid var(--accent-glow)' }}>
                                <Hotel size={24} color="var(--accent)" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Current Occupancy</h3>
                        </div>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-light)', padding: '6px 12px', borderRadius: '10px', fontWeight: '800', letterSpacing: '0.05em', border: '1px solid var(--glass-border)' }}>LIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Guests In-House</label>
                                <input
                                    name="guests"
                                    type="number"
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                                    style={{
                                        lineHeight: 1.2,
                                        fontSize: '2.5rem',
                                        fontWeight: '700',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--glass-border)',
                                        padding: '0.5rem 0',
                                        borderRadius: 0,
                                        color: 'var(--text-primary)',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Total Capacity</label>
                                <input
                                    name="capacity"
                                    type="number"
                                    value={capacity}
                                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                                    style={{
                                        lineHeight: 1.2,
                                        fontSize: '2.5rem',
                                        fontWeight: '300',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--glass-border)',
                                        padding: '0.5rem 0',
                                        borderRadius: 0,
                                        color: 'var(--text-secondary)',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Occupancy Rate</span>
                                <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)' }}>{capacity > 0 ? Math.round((guests / capacity) * 100) : 0}%</span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: '4px',
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

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            Update Guest Count
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: FUTURE BOOKINGS */}
            <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--chef-2), var(--chef-1))' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                            <Calendar size={24} color="var(--chef-exec)" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Upcoming Bookings</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setShowCalendar(true)} style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                            <Calendar size={14} /> View
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                            {showAddForm ? <X size={14} /> : <Plus size={14} />} {showAddForm ? "Cancel" : "Add"}
                        </button>
                        {reservations.length > 0 && (
                            <button className="btn btn-secondary" onClick={handleClearAll} style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                                <Trash2 size={14} /> Clear
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
                        backdropFilter: 'blur(8px)'
                    }} onClick={() => setShowCalendar(false)}>
                        <div className="glass-card animate-fade-in" style={{ width: 'min(400px, 90vw)', padding: '2rem', border: '1px solid var(--accent)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="btn btn-ghost" style={{ padding: '0.5rem' }}><ChevronLeft size={20} /></button>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="btn btn-ghost" style={{ padding: '0.5rem' }}><ChevronRight size={20} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ color: 'var(--text-muted)', fontWeight: '600', paddingBottom: '0.5rem' }}>{d}</div>)}
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
                                            position: 'relative',
                                            border: bookings ? 'none' : '1px solid transparent',
                                            transition: 'all 0.2s'
                                        }} title={bookings ? `${bookings.length} bookings` : ''}>
                                            {i + 1}
                                            {bookings && <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}></div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowCalendar(false)}>Close Calendar</button>
                        </div>
                    </div>
                )}

                {showAddForm && (
                    <form onSubmit={handleAddReservation} className="animate-fade-in" style={{
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
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Date</label>
                                <input name="date" type="date" required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Session</label>
                                <div className="custom-select-wrapper">
                                    <select name="session" defaultValue="DINNER">
                                        <option value="BREAKFAST">🍳 Breakfast</option>
                                        <option value="LUNCH">🍽️ Lunch</option>
                                        <option value="DINNER">🍷 Dinner</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                <select name="type" value={resType} onChange={(e) => setResType(e.target.value)}>
                                    <option value="STANDARD">🏢 Standard Reservation</option>
                                    <option value="FUNCTION">🎉 Event / Function</option>
                                </select>
                            </div>
                        </div>

                        {resType === "FUNCTION" && (
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Event Name</label>
                                <input name="eventName" required placeholder="e.g. VIP Corporate Gala" />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Guests</label>
                                <input name="count" type="number" required placeholder="0" />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Notes</label>
                                <input name="notes" placeholder="e.g. Dietary requirements..." />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
                            {isSubmitting ? "Saving..." : "Confirm Booking"}
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reservations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                            <div style={{ marginBottom: '1.5rem', opacity: 0.1, display: 'flex', justifyContent: 'center' }}>
                                <Calendar size={48} />
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>No upcoming bookings recorded.</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Use the Add button to schedule reservations.</p>
                        </div>
                    ) : reservations.sort((a, b) => new Date(a.date) - new Date(b.date)).map((res) => (
                        <div key={res.id} className="animate-fade-in" style={{
                            padding: '1.25rem',
                            background: res.type === "FUNCTION" ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.02)',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: res.type === "FUNCTION" ? '1px solid var(--accent-light)' : '1px solid var(--glass-border)',
                            transition: 'var(--transition)'
                        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-light)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = res.type === "FUNCTION" ? 'var(--accent-light)' : 'var(--glass-border)'}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>{new Date(res.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800', lineHeight: 1 }}>{new Date(res.date).getDate()}</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                        <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{res.eventName || "Standard Booking"}</p>
                                        {res.type === "FUNCTION" && (
                                            <span style={{ fontSize: '0.65rem', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <PartyPopper size={10} /> FUNCTION
                                            </span>
                                        )}
                                        {res.session && (
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--glass-border)' }}>
                                                {res.session === "BREAKFAST" && <Coffee size={10} />}
                                                {res.session === "LUNCH" && <Utensils size={10} />}
                                                {res.session === "DINNER" && <Wine size={10} />}
                                                {res.session}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {res.notes ? <span>{res.notes}</span> : <span style={{ opacity: 0.5 }}>No additional notes.</span>}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>{res.guestCount}</p>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GUESTS</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteReservation(res.id)}
                                    className="btn btn-ghost"
                                    style={{ width: '36px', height: '36px', padding: 0, color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}
                                    title="Delete Booking"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
