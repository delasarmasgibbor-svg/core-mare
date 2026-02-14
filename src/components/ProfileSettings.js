"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/staff";
import { User, Mail, Phone, Lock, Camera, Upload, Save, Loader2, ShieldCheck } from "lucide-react";

export default function ProfileSettings({ user }) {
    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [phone, setPhone] = useState(user.phone || "");
    const [avatar, setAvatar] = useState(user.avatar || "");
    const [password, setPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage("");

        const res = await updateProfile(user.id, {
            name,
            email,
            phone,
            avatar,
            password: password
        });

        if (res.success) {
            setMessage("Account updated successfully!");
            if (password) setPassword(""); // Clear password field
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage("Failed to update profile.");
        }
        setIsUpdating(false);
    };

    return (
        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', border: '1px solid var(--accent)' }}>
                        <ShieldCheck size={20} color="var(--accent-light)" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem' }}>Account & Profile</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Manage your personal information and security settings.
                </p>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                        <User size={14} /> Professional Name
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
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                        <Mail size={14} /> Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="chef@hotel.com"
                        required
                        disabled={isUpdating}
                        style={{ border: email !== user.email ? '1px solid var(--accent)' : '1px solid var(--glass-border)' }}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                        <Lock size={14} /> Change Password {user.email === 'manager@hotel.com' && <span style={{ color: '#f43f5e', fontSize: '0.65rem', marginLeft: 'auto' }}>REQUIRED</span>}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={user.email === 'manager@hotel.com' ? "Create a secure password" : "Leave blank to keep current"}
                        disabled={isUpdating}
                        required={user.email === 'manager@hotel.com'}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                        <Phone size={14} /> Phone Number
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
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                        <Camera size={14} /> Profile Picture
                    </label>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '18px',
                            background: avatar ? `url(${avatar}) center/cover` : 'var(--bg-surface-elevated)',
                            border: '2px solid var(--glass-border)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            color: 'var(--text-muted)'
                        }}>
                            {!avatar && <User size={32} />}
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
                            <label htmlFor="avatar-upload" className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <Upload size={14} /> Upload New Photo
                            </label>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                JPG or PNG. Max 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isUpdating} style={{ width: '100%', gap: '0.5rem' }}>
                        {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    {message && (
                        <p style={{
                            fontSize: '0.85rem',
                            color: message.includes('success') ? 'var(--status-success)' : 'var(--status-error)',
                            fontWeight: '600',
                            textAlign: 'center',
                            marginTop: '1rem',
                            animation: 'fadeIn 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            {message.includes('success') ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                            {message}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
