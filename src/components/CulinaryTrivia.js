"use client";

import { useState, useEffect } from "react";
import { TRIVIA_BANK, getWeeklyQuestions, getChefRank } from "@/lib/trivia-bank";
import { recordTriviaScore, getTriviaLeaderboard, getUserTriviaStatus } from "@/app/actions/trivia";

export default function CulinaryTrivia() {
    const [weekData, setWeekData] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [tries, setTries] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [history, setHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [view, setView] = useState("GAME"); // "GAME" or "LEADERBOARD"

    useEffect(() => {
        const data = getWeeklyQuestions();
        setWeekData(data);
        loadStatus(data.weekNumber);
        loadLeaderboard();
    }, []);

    const loadStatus = async (weekNum) => {
        const res = await getUserTriviaStatus(weekNum);
        if (res.success) {
            setHistory(res.history || []);
            setUserPoints(res.totalPoints || 0);
            setCorrectCount(res.correctCount || 0);
        }
    };

    const loadLeaderboard = async () => {
        const res = await getTriviaLeaderboard();
        if (res.success) setLeaderboard(res.topScores);
    };

    const handleAnswer = async (idx) => {
        if (showExplanation || isQuestionDone) return;

        const question = weekData.questions[currentIdx];
        const isCorrect = idx === question.answer;
        const newTries = tries + 1;

        setSelected(idx);
        setTries(newTries);

        if (isCorrect || newTries >= 2) {
            setShowExplanation(true);
            try {
                const res = await recordTriviaScore(question.id, weekData.weekNumber, newTries, isCorrect);
                if (res.success) {
                    setUserPoints(res.totalPoints);
                    setCorrectCount(prev => isCorrect ? prev + 1 : prev); // Optimistic update
                    await Promise.all([
                        loadStatus(weekData.weekNumber),
                        loadLeaderboard()
                    ]);
                }
            } catch (err) {
                console.error("Error saving trivia score:", err);
            }
        } else {
            // First wrong try
            setTimeout(() => setSelected(null), 1000);
        }
    };

    if (!weekData || !weekData.questions || weekData.questions.length === 0) {
        return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading Culinary Trivia...</div>;
    }

    const currentQuestion = weekData.questions[currentIdx];
    if (!currentQuestion) return null;

    const isQuestionDone = history.some(h => currentQuestion.id === h.questionId);

    return (
        <div className="glass-card" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '2rem'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        🧠 Culinary Master
                    </h3>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent-light)',
                        textTransform: 'uppercase',
                        background: 'rgba(79, 70, 229, 0.15)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        border: '1px solid var(--accent-glow)'
                    }}>
                        Week {weekData.weekNumber}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                    <button
                        onClick={() => setView("GAME")}
                        style={{
                            flex: 1,
                            fontSize: '0.75rem',
                            padding: '10px',
                            borderRadius: '10px',
                            background: view === "GAME" ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid ' + (view === "GAME" ? 'var(--accent)' : 'var(--glass-border)'),
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '700',
                            transition: 'all 0.2s'
                        }}
                    >Quiz</button>
                    <button
                        onClick={() => setView("LEADERBOARD")}
                        style={{
                            flex: 1,
                            fontSize: '0.75rem',
                            padding: '10px',
                            borderRadius: '10px',
                            background: view === "LEADERBOARD" ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid ' + (view === "LEADERBOARD" ? 'var(--accent)' : 'var(--glass-border)'),
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '700',
                            transition: 'all 0.2s'
                        }}
                    >Rankings</button>
                </div>
            </div>

            {view === "GAME" ? (
                <>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                        {weekData.questions.map((q, i) => {
                            const h = history.find(h => h.questionId === q.id);
                            return (
                                <div key={q.id} style={{
                                    flex: 1,
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: i === currentIdx ? 'var(--accent)' : h ? (h.correct ? '#10b981' : '#f43f5e') : 'rgba(255,255,255,0.1)'
                                }} />
                            );
                        })}
                    </div>

                    <p style={{ fontWeight: '600', marginBottom: '1.5rem', minHeight: '3.5rem' }}>{currentQuestion.question}</p>

                    <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {currentQuestion.options.map((opt, i) => {
                            const isCorrect = i === currentQuestion.answer;
                            const isSelected = selected === i;
                            const h = history.find(h => h.questionId === currentQuestion.id);

                            let border = '1px solid var(--glass-border)';
                            let bg = 'rgba(255,255,255,0.02)';

                            if (h) {
                                if (isCorrect) { bg = 'rgba(16, 185, 129, 0.15)'; border = '1px solid #10b981'; }
                            } else if (isSelected) {
                                if (isCorrect) { bg = 'rgba(16, 185, 129, 0.15)'; border = '1px solid #10b981'; }
                                else { bg = 'rgba(244, 63, 94, 0.15)'; border = '2px solid #f43f5e'; }
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    disabled={showExplanation || isQuestionDone}
                                    style={{
                                        padding: '0.85rem',
                                        borderRadius: '12px',
                                        textAlign: 'left',
                                        fontSize: '0.85rem',
                                        background: bg,
                                        border,
                                        color: 'white',
                                        cursor: (showExplanation || isQuestionDone) ? 'default' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {(showExplanation || isQuestionDone) && (
                        <div style={{
                            marginTop: 'auto',
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            border: '1px solid var(--glass-border)',
                            animation: 'fadeInUp 0.4s ease'
                        }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                                💡 <strong>{history.find(h => h.questionId === currentQuestion.id)?.correct ? 'Correct!' : 'Knowledge Check'}</strong> {currentQuestion.explanation}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                🏛️ <strong>History:</strong> {currentQuestion.history}
                            </p>

                            {currentIdx < weekData.questions.length - 1 ? (
                                <button
                                    onClick={() => {
                                        setCurrentIdx(currentIdx + 1);
                                        setShowExplanation(false);
                                        setSelected(null);
                                        setTries(0);
                                    }}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', fontSize: '0.8rem' }}
                                >Next Question</button>
                            ) : (
                                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: '700' }}>Week Complete! Your Score: {userPoints} pts</p>
                            )}
                        </div>
                    )}

                    {!showExplanation && !isQuestionDone && tries > 0 && (
                        <p style={{ fontSize: '0.7rem', color: '#fb7185', textAlign: 'center', marginTop: '0.5rem' }}>
                            ⚠️ {2 - tries} {tries === 1 ? 'try' : 'tries'} left
                        </p>
                    )}
                </>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Points</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>{userPoints}</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {getChefRank(correctCount).icon} {getChefRank(correctCount).title}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {leaderboard.map((entry, idx) => (
                            <div key={entry.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '0.75rem',
                                background: entry.userId === weekData.userId ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderRadius: '12px'
                            }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: idx < 3 ? 'var(--accent-light)' : 'var(--text-muted)', width: '20px' }}>{idx + 1}</span>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: entry.user.avatar ? `url(${entry.user.avatar}) center/cover` : 'var(--accent)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }} />
                                <span style={{ fontSize: '0.85rem', flex: 1, fontWeight: '600' }}>{entry.user.name}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{entry.points}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
