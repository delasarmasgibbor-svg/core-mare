"use client";

import { useState } from "react";
import { createStaff, deleteStaff, updateStaffPreference } from "@/app/actions/staff";

export default function StaffList({ initialStaff }) {
    const [staff, setStaff] = useState(initialStaff);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null); // State for the staff member being edited
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to remove this chef?")) {
            setIsSubmitting(true);
            const res = await deleteStaff(id);
            if (res.success) {
                setStaff(prev => prev.filter(c => c.id !== id));
            } else {
                alert(res.error);
            }
            setIsSubmitting(false);
        }
    };

    const handlePreferenceChange = async (id, newPref) => {
        setIsSubmitting(true);
        const res = await updateStaffPreference(id, newPref);
        if (res.success) {
            setStaff(prev => prev.map(c => c.id === id ? { ...c, preferredShift: newPref } : c));
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const res = await createStaff(formData);

        if (res.success) {
            setStaff(prev => [...prev, res.user]);
            setShowAddForm(false);
            e.target.reset();
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            preferredRestDay: formData.get("preferredRestDay"),
            avatar: editingStaff.avatar
        };

        // We use updateProfile for generic updates. 
        // Note: For a real app, we might want a specific adminUpdateProfile if permissions differ.
        // Importing updateProfile dynamically or passing it as prop would be cleaner, 
        // but here we'll assume it's available or use the server action directly.
        // Since updateProfile is imported from layout/staff actions, let's make sure we import it.
        // wait, I need to import updateProfile.

        const { updateProfile } = await import("@/app/actions/staff");
        const res = await updateProfile(editingStaff.id, data);

        if (res.success) {
            setStaff(prev => prev.map(c => c.id === editingStaff.id ? { ...c, ...data } : c));
            setEditingStaff(null);
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="animate-fade">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Staff Directory</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px' }}>Manage your kitchen personnel and their shift preferences.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', boxShadow: '0 4px 20px var(--accent-glow)' }}
                >
                    {showAddForm ? "Cancel" : "＋ Add New Staff"}
                </button>
            </header>

            {/* ADD FORM */}
            {showAddForm && (
                <div className="glass-card animate-fade" style={{ marginBottom: '3rem', border: '1px solid rgba(79, 70, 229, 0.3)', position: 'relative', overflow: 'hidden', padding: '3rem', background: 'linear-gradient(to bottom right, rgba(20,20,30,0.8), rgba(10,10,15,0.95))' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent)', boxShadow: '0 0 15px var(--accent)' }}></div>
                    <h3 style={{ marginBottom: '2.5rem', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>🆔</span> Add New Staff Member
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            <input name="name" required placeholder="e.g. Gordon Ramsay" style={{ fontSize: '1.1rem', padding: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                            <input name="email" type="email" required placeholder="chef@hotel.com" style={{ fontSize: '1.1rem', padding: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                            <input name="password" type="password" required placeholder="••••••••" style={{ fontSize: '1.1rem', padding: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default Shift</label>
                            <select name="preferredShift" defaultValue="" style={{ fontSize: '1.1rem', padding: '1rem' }}>
                                <option value="">🔄 Any / Flexible</option>
                                <option value="MORNING">☀️ Morning</option>
                                <option value="LUNCH">🍽️ Lunch</option>
                                <option value="PM">🌙 Evening</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ minWidth: '180px' }}>
                                {isSubmitting ? "Adding..." : "Add Staff Member"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingStaff && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setEditingStaff(null)}>
                    <div className="glass-card animate-fade" style={{ width: 'min(100%, 600px)', padding: '2.5rem', border: '1px solid var(--accent)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.4rem', fontWeight: '700' }}>✏️ Edit Staff Details</h3>
                        <form onSubmit={handleUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Full Name</label>
                                <input name="name" defaultValue={editingStaff.name} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Email</label>
                                <input name="email" type="email" defaultValue={editingStaff.email} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Phone</label>
                                <input name="phone" type="tel" defaultValue={editingStaff.phone} placeholder="+1..." />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                                    Profile Picture
                                </label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        background: editingStaff.avatar ? `url(${editingStaff.avatar}) center/cover` : 'var(--glass)',
                                        border: '2px solid var(--accent)',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        {!editingStaff.avatar && "👨‍🍳"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="manager-avatar-upload"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setEditingStaff({ ...editingStaff, avatar: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label htmlFor="manager-avatar-upload" className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                            📸 Change Photo
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Preferred Rest Days (Multi-select)</label>
                                <input type="hidden" name="preferredRestDay" value={editingStaff.preferredRestDay || ""} />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                                        const currentDays = (editingStaff.preferredRestDay || "").split(",").filter(Boolean);
                                        const isSelected = currentDays.includes(day);

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => {
                                                    let newDays;
                                                    if (isSelected) {
                                                        newDays = currentDays.filter(d => d !== day);
                                                    } else {
                                                        newDays = [...currentDays, day];
                                                    }
                                                    setEditingStaff({ ...editingStaff, preferredRestDay: newDays.join(",") });
                                                }}
                                                style={{
                                                    padding: '0.5rem 0.8rem',
                                                    fontSize: '0.85rem',
                                                    borderRadius: '20px',
                                                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                                                    background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                                    color: isSelected ? 'white' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingStaff(null)} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {staff.map((chef, index) => (
                    <div key={chef.id} className="glass-card" style={{
                        padding: '0',
                        position: 'relative',
                        transition: 'var(--transition)',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255,255,255,0.01)',
                        overflow: 'hidden',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ padding: '2rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: chef.avatar ? `url(${chef.avatar}) center/cover` : `var(--chef-${(index % 6) + 1})`,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.8rem',
                                    color: 'white',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {!chef.avatar && "👨‍🍳"}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', color: 'white', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chef.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chef.email}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(chef.id)}
                                    disabled={isSubmitting}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-muted)',
                                        transition: 'var(--transition)',
                                        opacity: isSubmitting ? 0.3 : 0.5
                                    }}
                                    title="Delete User"
                                    onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#fb7185'; } }}
                                    onMouseLeave={(e) => { if (!isSubmitting) { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                                >
                                    {isSubmitting ? "..." : "✕"}
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '0 2rem 2rem 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                marginTop: '0.5rem',
                                marginBottom: '2rem',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>Preferred Shift</label>
                                <select
                                    value={chef.preferredShift || "MORNING"}
                                    onChange={(e) => handlePreferenceChange(chef.id, e.target.value)}
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '0.25rem 0',
                                        fontSize: '0.9rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 0,
                                        color: isSubmitting ? 'var(--text-muted)' : 'white',
                                        width: '100%',
                                        cursor: isSubmitting ? 'wait' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    <option value="">🔄 Any / Flexible</option>
                                    <option value="MORNING">☀️ Morning</option>
                                    <option value="LUNCH">🍽️ Lunch</option>
                                    <option value="PM">🌙 Evening</option>
                                </select>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.8rem', padding: '0.7rem' }}
                                    onClick={() => setEditingStaff(chef)}
                                >
                                    Edit Details
                                </button>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.7rem', opacity: 0.5, cursor: 'not-allowed' }}>Assign Shift</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
