"use client";

import { useState, useMemo } from "react";
import { DndContext, useDraggable, useDroppable, useSensors, useSensor, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { saveRoster, clearRoster as clearRosterAction } from "@/app/actions/roster";

const SHIFT_TYPES = ["MORNING", "LUNCH", "PM"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function DraggableChef({ chef, stats }) {
    // CRITICAL: Using setActivatorNodeRef to restricting dragging ONLY to the handle
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id: `chef-${chef.id}`,
        data: chef
    });

    const isOverLimit = stats?.hours > chef.maxWeeklyHours;

    // Availability Dots
    const availDots = ["MORNING", "LUNCH", "PM"].map(type => {
        const isAvail = chef.availabilities?.some(a => a.shiftType === type);
        return (
            <div key={type} title={`${type}: ${isAvail ? 'Available' : 'Unavailable'}`} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isAvail ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
                border: isAvail ? 'none' : '1px solid rgba(255,255,255,0.2)'
            }} />
        );
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        background: chef.color || 'var(--accent)',
        padding: '0.75rem 1rem',
        borderRadius: '16px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'white',
        marginBottom: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: isOverLimit ? '0 0 15px rgba(244, 63, 94, 0.4)' : '0 2px 10px rgba(0,0,0,0.15)',
        border: isOverLimit ? '2px solid #f43f5e' : '1px solid transparent',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        width: '100%',
        position: 'relative',
        zIndex: isDragging ? 999 : 1,
        touchAction: 'manipulation' // Allow both vertical and horizontal scrolling on the card body
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                    {/* EXPLICIT DRAG HANDLE */}
                    <div
                        ref={setActivatorNodeRef}
                        {...listeners}
                        style={{
                            cursor: 'grab',
                            minWidth: '32px',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'none', // Block scrolling ONLY on this handle
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            marginLeft: '-4px'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', opacity: 0.8, lineHeight: 1 }}>:::</span>
                    </div>

                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: chef.avatar ? `url(${chef.avatar}) center/cover` : 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {!chef.avatar && (chef.preferredShift === "MORNING" ? "☀️" : chef.preferredShift === "LUNCH" ? "🍽️" : "🌙")}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ letterSpacing: '0.02em', pointerEvents: 'none', lineHeight: 1.2 }}>{chef.name}</span>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    color: isOverLimit ? '#ffa0a0' : 'white',
                    fontWeight: 'bold'
                }}>
                    {stats?.hours || 0}h
                </span>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', paddingLeft: '52px' }}>
                {availDots}
            </div>
        </div>
    );
}

function RosterCell({ id, shifts, onRemove, conflicts }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    const style = {
        minHeight: '120px',
        background: isOver ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255,255,255,0.01)',
        border: '1px solid',
        borderColor: isOver ? 'var(--accent)' : 'var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        boxShadow: isOver ? '0 8px 24px rgba(79, 70, 229, 0.15)' : 'none'
    };

    return (
        <div ref={setNodeRef} style={style}>
            {shifts.length === 0 && !isOver && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    opacity: 0.4
                }}>
                    Drop Here
                </div>
            )}
            {shifts.map((s, i) => {
                const chefConflict = conflicts[`${id}-${s.id}`];
                return (
                    <div key={`${id}-${s.id}-${i}`} onClick={() => onRemove(id, s.id)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <div style={{
                            background: s.color || 'var(--accent)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: chefConflict ? '2px solid #fff' : 'none',
                            boxShadow: chefConflict ? '0 0 15px #f43f5e' : 'var(--shadow-sm)',
                            fontWeight: '600'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '4px',
                                    background: s.avatar ? `url(${s.avatar}) center/cover` : 'rgba(255,255,255,0.3)',
                                    flexShrink: 0
                                }} />
                                <span style={{
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%'
                                }}>{s.name}</span>
                            </div>
                            {chefConflict && (
                                <span title={chefConflict.join(", ")} style={{
                                    marginLeft: '6px',
                                    cursor: 'help',
                                    animation: 'pulse 1.5s infinite',
                                    fontSize: '1rem'
                                }}>⚠️</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function RosterManager({ initialChefs, initialRoster }) {
    const [chefs] = useState(initialChefs);
    const [roster, setRoster] = useState(initialRoster || {});
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100, // Reduced delay since we are using explicit handle
                tolerance: 5,
            },
        })
    );

    // --- Intelligence Layer: Conflict Detection ---
    const stats = useMemo(() => {
        const chefStats = {};
        const conflicts = {};

        chefs.forEach(chef => {
            chefStats[chef.id] = { hours: 0, days: new Set() };
        });

        Object.entries(roster).forEach(([cellId, assignedChefs]) => {
            const [day, type] = cellId.split("-");

            assignedChefs.forEach(chef => {
                if (!chefStats[chef.id]) return;

                // 1. Accumulate Hours (Assume 8h per shift)
                chefStats[chef.id].hours += 8;

                // 2. Track Multiple Shifts per Day
                if (chefStats[chef.id].days.has(day)) {
                    conflicts[`${cellId}-${chef.id}`] = (conflicts[`${cellId}-${chef.id}`] || [])
                    conflicts[`${cellId}-${chef.id}`].push("Double Shift");
                }
                chefStats[chef.id].days.add(day);

                // 3. Check Availability
                const dayIdx = DAYS.indexOf(day);
                const isAvailable = chef.availabilities?.some(a =>
                    a.dayOfWeek === dayIdx && a.shiftType === type
                );

                // If they have explicit availabilities, check against them
                if (chef.availabilities?.length > 0 && !isAvailable) {
                    conflicts[`${cellId}-${chef.id}`] = (conflicts[`${cellId}-${chef.id}`] || [])
                    conflicts[`${cellId}-${chef.id}`].push("Unavailable");
                }
            });
        });

        // 4. Check Weekly Hour Limits
        chefs.forEach(chef => {
            if (chef.maxWeeklyHours && chefStats[chef.id].hours > chef.maxWeeklyHours) {
                chefStats[chef.id].overLimit = true;
            }
        });

        return { chefStats, conflicts };
    }, [roster, chefs]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over) {
            const chef = active.data.current;
            const cellId = over.id;

            setRoster(prev => {
                const currentInCell = prev[cellId] || [];
                if (currentInCell.find(c => c.id === chef.id)) return prev;
                return {
                    ...prev,
                    [cellId]: [...currentInCell, chef]
                };
            });
        }
    };

    const removeChefFromCell = (cellId, chefId) => {
        setRoster(prev => ({
            ...prev,
            [cellId]: prev[cellId].filter(c => c.id !== chefId)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await saveRoster(roster);
        if (res.success) {
            alert("Roster saved successfully!");
        } else {
            alert(res.error);
        }
        setIsSaving(false);
    };

    const handleClear = async () => {
        if (confirm("Clear all shifts?")) {
            setIsSaving(true);
            const res = await clearRosterAction();
            if (res.success) {
                setRoster({});
            } else {
                alert(res.error);
            }
            setIsSaving(false);
        }
    };

    // --- Auto-Gen Settings ---
    const [showAutoSettings, setShowAutoSettings] = useState(false);
    const [shiftLimits, setShiftLimits] = useState({
        MORNING: 1,
        LUNCH: 1,
        PM: 2
    });

    const autoGenerate = () => {
        const newRoster = {};
        const staffByDay = {}; // Track who is working on which day to prevent double shifts if needed

        // Initialize helper to track shifts per day per chef
        chefs.forEach(chef => {
            staffByDay[chef.id] = new Set();
        });

        // Helper to check if chef is available for a day AND shift
        const isChefAvailable = (chef, day, shiftType) => {
            // 1. Check Rest Days
            if (chef.preferredRestDay && chef.preferredRestDay.split(',').includes(day)) return false;

            // 2. Strict Shift Enforcement
            if (chef.preferredShift && chef.preferredShift !== shiftType) return false;

            // 3. No Double Shifts
            if (staffByDay[chef.id].has(day)) return false;

            return true;
        };

        let chefIdx = 0;

        DAYS.forEach(day => {
            SHIFT_TYPES.forEach(type => {
                const shiftId = `${day}-${type}`;
                const assigned = [];
                const limit = shiftLimits[type] || 0;

                // Try to fill this shift with specific limit for this type
                let attempts = 0;
                while (assigned.length < limit && attempts < chefs.length * 2) {
                    const candidate = chefs[chefIdx % chefs.length];
                    chefIdx++;
                    attempts++;

                    if (isChefAvailable(candidate, day, type)) {
                        assigned.push(candidate);
                        staffByDay[candidate.id].add(day);
                    }
                }

                newRoster[shiftId] = assigned;
            });
        });

        setRoster(newRoster);
        setShowAutoSettings(false);
    };

    return (
        <div className="animate-fade" style={{ padding: '0.5rem' }}>
            {/* FORCE DEBUG BANNER v2.4 */}
            <div style={{
                background: '#dc2626',
                color: 'white',
                padding: '1rem',
                textAlign: 'center',
                fontWeight: 'bold',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '1.2rem',
                border: '2px solid white',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.5)'
            }}>
                🚨 v2.4 FORCE UPDATE ACTIVE 🚨<br />
                <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>
                    1. SWIPE TABLES TO SCROLL<br />
                    2. HOLD <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>:::</span> TO DRAG
                </span>
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Weekly Roster</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Orchestrate your kitchen crew for the upcoming week.</p>
                    </div>
                </div>

                {/* Controls Bar - Stacked on mobile, row on desktop */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)',
                    justifyContent: 'flex-end'
                }}>
                    <button className="btn btn-secondary" onClick={handleClear} style={{ flex: '1 1 auto' }}>Clear</button>
                    <div style={{ position: 'relative', flex: '1 1 auto' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAutoSettings(!showAutoSettings)} style={{ width: '100%' }}>
                            ✨ Auto Generate
                        </button>
                        {showAutoSettings && (
                            <div className="glass-card" style={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                width: '300px',
                                zIndex: 50,
                                padding: '1.5rem',
                                border: '1px solid var(--accent-glow)'
                            }}>
                                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Auto-Gen Settings</h4>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Staff Limits Per Shift</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {Object.entries(shiftLimits).map(([type, limit]) => (
                                            <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>{type === 'PM' ? 'Dinner' : type.charAt(0) + type.slice(1).toLowerCase()}</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    value={limit}
                                                    onChange={(e) => setShiftLimits({ ...shiftLimits, [type]: parseInt(e.target.value) || 0 })}
                                                    style={{ width: '60px', padding: '0.25rem 0.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                                    Logic will automatically skip staff on their <strong>Preferred Rest Day</strong> and enforce their <strong>Preferred Shift</strong> (e.g. Dinner Only).
                                </div>

                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={autoGenerate}>
                                    Generate Roster
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: '1 1 auto' }}>
                        {isSaving ? "Syncing..." : "Publish Roster"}
                    </button>
                </div>
            </header>

            <div className="roster-flex-container" style={{
                display: 'flex',
                gap: '2.5rem',
                alignItems: 'flex-start'
            }}>
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="glass-card roster-grid-container" style={{
                        flex: 1,
                        width: '100%',
                        overflowX: 'auto',
                        padding: '1.5rem',
                        minHeight: '600px',
                        WebkitOverflowScrolling: 'touch',
                        position: 'relative',
                        display: 'block',
                        maxWidth: '100vw' // Ensure it doesn't overflow the viewport width un-scrollably
                    }}>
                        <div style={{ minWidth: '1000px' }}> {/* Increased min-width for better breathing room, scroll enabled */}
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', width: '120px', background: 'var(--bg-surface)', position: 'sticky', left: 0, zIndex: 10 }}>Shift Time</th>
                                        {DAYS.map(d => (
                                            <th key={d} style={{ textAlign: 'center', width: '180px' }}>
                                                <div style={{ color: 'white', fontSize: '0.9rem', marginBottom: '4px' }}>{d.slice(0, 3)}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>WEEKDAY</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SHIFT_TYPES.map(type => (
                                        <tr key={type}>
                                            <td style={{
                                                padding: '1.5rem 0.5rem',
                                                verticalAlign: 'top',
                                                background: 'var(--bg-surface)',
                                                position: 'sticky',
                                                left: 0,
                                                zIndex: 10,
                                                borderRight: '1px solid var(--glass-border)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{
                                                        fontSize: '1rem',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'var(--glass)',
                                                        borderRadius: '8px',
                                                        flexShrink: 0
                                                    }}>
                                                        {type === "MORNING" ? "☀️" : type === "LUNCH" ? "🍽️" : "🌙"}
                                                    </span>
                                                    <div>
                                                        <p style={{ fontWeight: '700', color: 'white', fontSize: '0.85rem', lineHeight: 1 }}>{type}</p>
                                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {type === "MORNING" ? "06:00" : type === "LUNCH" ? "11:00" : "14:00"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {DAYS.map(day => {
                                                const id = `${day}-${type}`;
                                                return (
                                                    <td key={id} style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                                                        <RosterCell
                                                            id={id}
                                                            shifts={roster[id] || []}
                                                            onRemove={removeChefFromCell}
                                                            conflicts={stats.conflicts}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <aside className="glass-card roster-directory" style={{
                        width: '100%',
                        maxWidth: '280px', // Reduced from 320px
                        position: 'sticky',
                        top: '2rem',
                        alignSelf: 'flex-start',
                        flexShrink: 0
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Staff Directory</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Drag staff to the roster.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {chefs.map(chef => (
                                <DraggableChef
                                    key={chef.id}
                                    chef={chef}
                                    stats={stats.chefStats[chef.id]}
                                />
                            ))}
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', padding: '0 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
                                Available
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
                                Not Avail.
                            </div>
                        </div>

                        <div style={{
                            marginTop: '2.5rem',
                            padding: '1.5rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '24px',
                            border: '1px solid var(--accent-glow)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>💡</span>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-light)',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>Intelligence Active</p>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, opacity: 0.9 }}>
                                ChefOps is monitoring work hours and availability in real-time. Look for <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>⚠️</span> icons to identify scheduling conflicts.
                            </p>
                        </div>
                    </aside>
                </DndContext>
            </div>
        </div>
    );
}
