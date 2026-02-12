"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/staff";

export default function ProfileSettings({ user }) {
    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [phone, setPhone] = useState(user.phone || "");
    const [avatar, setAvatar] = useState(user.avatar || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage("");

        const res = await updateProfile(user.id, { name, email, phone, avatar });
        if (res.success) {
            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage("Failed to update profile.");
        }
        setIsUpdating(false);
    };

    return (
        <div className="glass-card" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>👤 Identity Setup</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Manage your professional details. These will be visible to the management team.
            </p>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                        Professional Name / Title
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Head Chef Julian"
                        required
                        disabled={isUpdating}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="chef@hotel.com"
                        required
                        disabled={isUpdating}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        disabled={isUpdating}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                        Profile Picture
                    </label>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            background: avatar ? `url(${avatar}) center/cover` : 'var(--glass)',
                            border: '2px solid var(--accent)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }}>
                            {!avatar && "👨‍🍳"}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="file"
                                accept="image/*"
                                id="avatar-upload"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 2 * 1024 * 1024) {
                                            alert("Image is too large. Please select a file under 2MB.");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setAvatar(reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <label htmlFor="avatar-upload" className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                📸 Choose Photo
                            </label>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                JPG or PNG. Max 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isUpdating} style={{ flex: 1 }}>
                        {isUpdating ? "Saving Changes..." : "Update Identity"}
                    </button>
                </div>
                {message && (
                    <p style={{
                        fontSize: '0.85rem',
                        color: message.includes('success') ? '#10b981' : '#f43f5e',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginTop: '0.5rem',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
