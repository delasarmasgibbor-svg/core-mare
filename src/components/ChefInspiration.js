"use client";

import { useState, useEffect } from "react";
import { createIdea, getIdeas } from "@/app/actions/ideas";
import { getChefRank } from "@/lib/trivia-bank";
import { Send, MessageSquare, Clock, User, Award } from "lucide-react";

export default function ChefInspiration() {
    const [ideas, setIdeas] = useState([]);
    const [newIdea, setNewIdea] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadIdeas();
    }, []);

    const loadIdeas = async () => {
        const res = await getIdeas();
        if (res.success) {
            setIdeas(res.ideas);
        }
        setIsLoading(false);
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newIdea.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const res = await createIdea(newIdea);
            if (res.success) {
                setNewIdea("");
                await loadIdeas();
            } else {
                console.error("Post failed:", res.error);
            }
        } catch (err) {
            console.error("Network error posting idea:", err);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={20} color="var(--accent-light)" /> Chef's Daily Wall
                </h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>Live Feed</span>
            </div>

            <form onSubmit={handlePost} style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <textarea
                        value={newIdea}
                        onChange={(e) => setNewIdea(e.target.value)}
                        placeholder="What's on your mind, Chef?"
                        style={{
                            width: '100%',
                            height: '70px',
                            padding: '0.85rem',
                            paddingRight: '3.5rem',
                            borderRadius: '12px',
                            resize: 'none',
                            fontSize: '0.85rem',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        disabled={isPosting}
                    />
                    <button
                        type="submit"
                        disabled={isPosting || !newIdea.trim()}
                        style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'var(--accent)',
                            border: 'none',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            opacity: isPosting || !newIdea.trim() ? 0.5 : 1
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }} className="custom-scrollbar">
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Preparing the wall...</div>
                ) : ideas.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        The wall is empty. Post the first update!
                    </div>
                ) : (
                    ideas.map((idea) => {
                        const correctCount = idea.author?.triviaScore?.correctCount || 0;
                        const rank = getChefRank(correctCount);

                        return (
                            <div key={idea.id} style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '14px',
                                border: '1px solid var(--glass-border)',
                                animation: 'fadeIn 0.3s ease-out'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: idea.author?.avatar ? `url(${idea.author.avatar}) center/cover` : 'var(--glass)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {!idea.author?.avatar && <User size={18} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {idea.author?.name || "Chef"}
                                            </span>
                                            <span style={{
                                                fontSize: '0.55rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: 'rgba(79, 70, 229, 0.1)',
                                                color: 'var(--accent-light)',
                                                border: '1px solid rgba(79, 70, 229, 0.2)',
                                                fontWeight: '800',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                flexShrink: 0
                                            }}>
                                                <Award size={10} /> {rank.title}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} />
                                            {new Date(idea.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(idea.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordWrap: 'break-word' }}>
                                    {idea.content}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
