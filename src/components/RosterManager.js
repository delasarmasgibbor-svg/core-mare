"use client";

import { useState, useMemo, useEffect } from "react";
import { DndContext, useDraggable, useDroppable, useSensors, useSensor, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { saveRoster, clearRoster as clearRosterAction } from "@/app/actions/roster";
import {
    GripVertical,
    Sun,
    Utensils,
    Moon,
    AlertTriangle,
    Trash2,
    Wand2,
    Save,
    Info,
    User,
    Clock,
    ChevronDown,
    ChevronUp
} from "lucide-react";

const SHIFT_TYPES = ["MORNING", "LUNCH", "PM"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function DraggableChef({ chef, stats }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id: `chef-${chef.id}`,
        data: chef
    });

    const isOverLimit = stats?.hours > chef.maxWeeklyHours;

    const availDots = ["MORNING", "LUNCH", "PM"].map(type => {
        const isAvail = chef.availabilities?.some(a => a.shiftType === type);
        return (
            <div key={type} title={`${type}: ${isAvail ? 'Available' : 'Unavailable'}`} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isAvail ? 'var(--status-success)' : 'rgba(255,255,255,0.1)',
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
        boxShadow: isOverLimit ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'var(--shadow-sm)',
        border: isOverLimit ? '2px solid var(--status-error)' : '1px solid rgba(255,255,255,0.1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        width: '100%',
        position: 'relative',
        zIndex: isDragging ? 999 : 1,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                            touchAction: 'none',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            marginLeft: '-4px',
                            color: 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <GripVertical size={18} />
                    </div>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: chef.avatar ? `url(${chef.avatar}) center/cover` : 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        color: 'white'
                    }}>
                        {!chef.avatar && <User size={16} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ letterSpacing: '0.02em', pointerEvents: 'none', lineHeight: 1.2 }}>{chef.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            {chef.preferredShift === "MORNING" && <Sun size={10} color="var(--morning)" />}
                            {chef.preferredShift === "LUNCH" && <Utensils size={10} color="var(--lunch)" />}
                            {chef.preferredShift === "PM" && <Moon size={10} color="var(--pm)" />}
                        </div>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    color: isOverLimit ? 'var(--status-error)' : 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <Clock size={10} />
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
        minHeight: '100px',
        background: isOver ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.01)',
        border: '1px solid',
        borderColor: isOver ? 'var(--accent)' : 'var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '8px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'relative',
        boxShadow: isOver ? '0 8px 24px rgba(99, 102, 241, 0.15)' : 'none'
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
                    Drop
                </div>
            )}
            {shifts.map((s, i) => {
                const chefConflict = conflicts[`${id}-${s.id}`];
                return (
                    <div key={`${id}-${s.id}-${i}`} onClick={() => onRemove(id, s.id)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <div style={{
                            background: s.color || 'var(--accent)',
                            padding: '6px 10px',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: chefConflict ? '2px solid var(--status-error)' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: chefConflict ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'var(--shadow-sm)',
                            fontWeight: '600'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '6px',
                                    background: s.avatar ? `url(${s.avatar}) center/cover` : 'rgba(255,255,255,0.3)',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!s.avatar && <User size={10} />}
                                </div>
                                <span style={{
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%'
                                }}>{s.name.split(' ')[0]}</span>
                            </div>
                            {chefConflict && <AlertTriangle size={12} />}
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
    const [isMobile, setIsMobile] = useState(false);

    // Detect Mobile for Responsive Layout
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

    const stats = useMemo(() => {
        const chefStats = {};
        const conflicts = {};
        chefs.forEach(chef => { chefStats[chef.id] = { hours: 0, days: new Set() }; });

        Object.entries(roster).forEach(([cellId, assignedChefs]) => {
            const [day, type] = cellId.split("-");
            assignedChefs.forEach(chef => {
                if (!chefStats[chef.id]) return;
                chefStats[chef.id].hours += 8;
                if (chefStats[chef.id].days.has(day)) {
                    conflicts[`${cellId}-${chef.id}`] = (conflicts[`${cellId}-${chef.id}`] || []);
                    conflicts[`${cellId}-${chef.id}`].push("Double Shift");
                }
                chefStats[chef.id].days.add(day);

                const dayIdx = DAYS.indexOf(day);
                const isAvailable = chef.availabilities?.some(a => a.dayOfWeek === dayIdx && a.shiftType === type);
                // Strict check only if availabilities are defined
                if (chef.availabilities?.length > 0 && !isAvailable) {
                    // Temporarily removed strict availability conflict for better UX unless explicitly set
                    // conflicts[`${cellId}-${chef.id}`] = (conflicts[`${cellId}-${chef.id}`] || []).concat("Unavailable");
                }
            });
        });
        chefs.forEach(chef => {
            if (chef.maxWeeklyHours && chefStats[chef.id].hours > chef.maxWeeklyHours) chefStats[chef.id].overLimit = true;
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
                return { ...prev, [cellId]: [...currentInCell, chef] };
            });
        }
    };

    const removeChefFromCell = (cellId, chefId) => {
        setRoster(prev => ({ ...prev, [cellId]: prev[cellId].filter(c => c.id !== chefId) }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await saveRoster(roster);
        if (res.success) alert("Roster saved successfully!");
        else alert(res.error);
        setIsSaving(false);
    };

    const handleClear = async () => {
        if (confirm("Clear all shifts?")) {
            setIsSaving(true);
            const res = await clearRosterAction();
            if (res.success) setRoster({});
            else alert(res.error);
            setIsSaving(false);
        }
    };

    const [showAutoSettings, setShowAutoSettings] = useState(false);
    const [shiftLimits, setShiftLimits] = useState({ MORNING: 1, LUNCH: 1, PM: 2 });

    const autoGenerate = () => {
        const newRoster = {};
        const staffByDay = {}; // Track who is working on which day to prevent double shifts if needed
        chefs.forEach(chef => { staffByDay[chef.id] = new Set(); });

        const isChefAvailable = (chef, day, shiftType) => {
            if (chef.preferredRestDay && chef.preferredRestDay.split(',').map(d => d.trim()).includes(day)) return false;
            // Relaxed preferred shift logic: if they prefer MORNING, they can still work LUNCH if needed, unless strict?
            // For now, let's keep it advisory or strict. Let's make it strict for auto-gen to be "smart".
            if (chef.preferredShift && chef.preferredShift !== "" && chef.preferredShift !== shiftType) return false;
            if (staffByDay[chef.id].has(day)) return false; // No double shifts
            return true;
        };

        let chefIdx = 0;
        DAYS.forEach(day => {
            SHIFT_TYPES.forEach(type => {
                const shiftId = `${day}-${type}`;
                const assigned = [];
                const limit = shiftLimits[type] || 0;
                let attempts = 0;
                // Randomized start index for better distribution
                let currentChefIdx = chefIdx + Math.floor(Math.random() * chefs.length);

                while (assigned.length < limit && attempts < chefs.length) {
                    const candidate = chefs[currentChefIdx % chefs.length];
                    currentChefIdx++;
                    attempts++;

                    if (isChefAvailable(candidate, day, type)) {
                        assigned.push(candidate);
                        staffByDay[candidate.id].add(day);
                    }
                }
                newRoster[shiftId] = assigned;
            });
            chefIdx++; // Rotate starting chef each day
        });
        setRoster(newRoster);
        setShowAutoSettings(false);
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Weekly Roster</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Orchestrate your kitchen crew.</p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.75rem',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <button className="btn btn-secondary" onClick={handleClear} style={{ flex: '1 1 auto', fontSize: '0.8rem' }}>
                        <Trash2 size={14} /> Clear
                    </button>
                    <div style={{ position: 'relative', flex: '1 1 auto' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAutoSettings(!showAutoSettings)} style={{ width: '100%', fontSize: '0.8rem' }}>
                            <Wand2 size={14} /> Auto
                        </button>
                        {showAutoSettings && (
                            <div className="glass-card" style={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                width: '280px',
                                zIndex: 100,
                                padding: '1.25rem',
                                border: '1px solid var(--accent-glow)',
                                background: 'var(--bg-surface-elevated)'
                            }}>
                                <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Auto-Gen Settings</h4>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {Object.entries(shiftLimits).map(([type, limit]) => (
                                        <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>{type === 'PM' ? 'Dinner' : type.charAt(0) + type.slice(1).toLowerCase()}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={limit}
                                                onChange={(e) => setShiftLimits({ ...shiftLimits, [type]: parseInt(e.target.value) || 0 })}
                                                style={{ width: '50px', padding: '4px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={autoGenerate}>
                                    Generate
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: '1 1 auto', fontSize: '0.8rem' }}>
                        <Save size={14} /> {isSaving ? "Syncing..." : "Publish"}
                    </button>
                </div>
            </header>

            <div className="roster-flex-container" style={{
                display: 'flex',
                gap: '2rem',
                flexDirection: isMobile ? 'column-reverse' : 'row',
                alignItems: 'flex-start'
            }}>
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    {/* ROSTER GRID / LIST */}
                    <div className="glass-card" style={{
                        flex: 1,
                        width: '100%',
                        padding: isMobile ? '1rem' : '1.5rem',
                        minHeight: '600px',
                        position: 'relative',
                        background: 'rgba(255,255,255,0.01)'
                    }}>
                        {isMobile ? (
                            // MOBILE VIEW: Stacked Days
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {DAYS.map(day => (
                                    <div key={day} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: '700', color: 'white' }}>{day}</span>
                                        </div>
                                        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {SHIFT_TYPES.map(type => (
                                                <div key={`${day}-${type}`} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', alignItems: 'start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: '8px' }}>
                                                        {type === "MORNING" && <Sun size={14} color="var(--morning)" />}
                                                        {type === "LUNCH" && <Utensils size={14} color="var(--lunch)" />}
                                                        {type === "PM" && <Moon size={14} color="var(--pm)" />}
                                                        {type}
                                                    </div>
                                                    <RosterCell
                                                        id={`${day}-${type}`}
                                                        shifts={roster[`${day}-${type}`] || []}
                                                        onRemove={removeChefFromCell}
                                                        conflicts={stats.conflicts}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // DESKTOP VIEW: Table
                            <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '900px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '1rem', width: '120px', position: 'sticky', left: 0, background: 'var(--bg-surface)', zIndex: 10 }}>Shift</th>
                                            {DAYS.map(d => (
                                                <th key={d} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{d.slice(0, 3)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SHIFT_TYPES.map(type => (
                                            <tr key={type}>
                                                <td style={{ padding: '1rem', verticalAlign: 'top', borderRight: '1px solid var(--glass-border)', position: 'sticky', left: 0, background: 'var(--bg-surface)', zIndex: 10 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                                        {type === "MORNING" && <Sun size={16} color="var(--morning)" />}
                                                        {type === "LUNCH" && <Utensils size={16} color="var(--lunch)" />}
                                                        {type === "PM" && <Moon size={16} color="var(--pm)" />}
                                                        {type}
                                                    </div>
                                                </td>
                                                {DAYS.map(day => (
                                                    <td key={`${day}-${type}`} style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                                                        <RosterCell
                                                            id={`${day}-${type}`}
                                                            shifts={roster[`${day}-${type}`] || []}
                                                            onRemove={removeChefFromCell}
                                                            conflicts={stats.conflicts}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* DIRECTORY */}
                    <aside className="glass-card" style={{
                        width: '100%',
                        maxWidth: isMobile ? '100%' : '280px',
                        position: isMobile ? 'relative' : 'sticky',
                        top: isMobile ? 0 : '2rem',
                        alignSelf: 'flex-start',
                        flexShrink: 0
                    }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Staff Directory ({chefs.length})</h3>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '0.75rem', overflowX: isMobile ? 'auto' : 'hidden', paddingBottom: isMobile ? '1rem' : 0 }}>
                            {chefs.map(chef => (
                                <div key={chef.id} style={{ minWidth: isMobile ? '200px' : 'auto' }}>
                                    <DraggableChef
                                        chef={chef}
                                        stats={stats.chefStats[chef.id]}
                                    />
                                </div>
                            ))}
                        </div>
                    </aside>
                </DndContext>
            </div>
        </div>
    );
}
