"use client";

import { useState, useMemo, useEffect } from "react";
import { DndContext, useDraggable, useDroppable, useSensors, useSensor, PointerSensor, TouchSensor, DragOverlay } from "@dnd-kit/core";
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

function DraggableChef({ chef, stats, onUpdateMaxHours }) {
    const [editingHours, setEditingHours] = useState(false);
    const [tempHours, setTempHours] = useState(chef.maxWeeklyHours || 40);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id: `chef-${chef.id}`,
        data: chef
    });

    const isOverLimit = chef.employmentType === 'CASUAL' && stats?.hours > chef.maxWeeklyHours;
    const isCasual = chef.employmentType === 'CASUAL';

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

    const handleSaveHours = () => {
        setEditingHours(false);
        if (onUpdateMaxHours && tempHours !== chef.maxWeeklyHours) {
            onUpdateMaxHours(chef.id, tempHours);
        }
    };

    const style = {
        // transform: CSS.Translate.toString(transform), // Disable transform for sidebar item when using overlay
        background: chef.color || 'var(--accent)',
        padding: '0.75rem 1rem',
        borderRadius: '16px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: isOverLimit ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'var(--shadow-sm)',
        border: isOverLimit ? '2px solid var(--status-error)' : '1px solid rgba(255,255,255,0.1)',
        opacity: isDragging ? 0.3 : 1, // Dim when dragging
        width: '100%',
        position: 'relative',
        zIndex: isDragging ? 999 : 1
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
                        color: 'var(--text-primary)'
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
                {isCasual && editingHours ? (
                    <input
                        type="number"
                        value={tempHours}
                        onChange={(e) => setTempHours(parseInt(e.target.value) || 0)}
                        onBlur={handleSaveHours}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveHours()}
                        autoFocus
                        min={0}
                        max={168}
                        style={{
                            width: '50px',
                            padding: '2px 4px',
                            fontSize: '0.7rem',
                            textAlign: 'center',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1.5px solid var(--accent)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontWeight: 'bold'
                        }}
                    />
                ) : (
                    <span
                        onClick={(e) => { if (isCasual) { e.stopPropagation(); setEditingHours(true); setTempHours(chef.maxWeeklyHours || 40); } }}
                        title={isCasual ? 'Click to edit max hours' : ''}
                        style={{
                            fontSize: '0.7rem',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            color: isOverLimit ? 'var(--status-error)' : 'white',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: isCasual ? 'pointer' : 'default'
                        }}
                    >
                        {isCasual && <span style={{ fontSize: '0.55rem', background: 'rgba(251,191,36,0.3)', color: '#fbbf24', padding: '1px 4px', borderRadius: '4px', fontWeight: '800', letterSpacing: '0.03em' }}>C</span>}
                        <Clock size={10} />
                        {stats?.hours || 0}h{isCasual && `/${chef.maxWeeklyHours || '?'}h`}
                    </span>
                )}
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
                    fontSize: '0.75rem',
                    color: 'var(--accent-dark)',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    opacity: 0.8
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
                            color: 'var(--text-primary)',
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
    const [chefs, setChefs] = useState(initialChefs);
    const [roster, setRoster] = useState(initialRoster || {});
    const [isSaving, setIsSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(true); // Mobile First Default
    const [activeChef, setActiveChef] = useState(null); // For DragOverlay

    // Detect Mobile for Responsive Layout
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1200);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } })
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
                // Only flag double-shift as a conflict for CASUAL employees
                if (chef.employmentType === 'CASUAL' && chefStats[chef.id].days.has(day)) {
                    conflicts[`${cellId}-${chef.id}`] = (conflicts[`${cellId}-${chef.id}`] || []);
                    conflicts[`${cellId}-${chef.id}`].push("Double Shift");
                }
                chefStats[chef.id].days.add(day);

                // Flag if staff is assigned to a non-preferred shift
                if (chef.preferredShift && chef.preferredShift !== "") {
                    const preferredShifts = chef.preferredShift.split(',').map(s => s.trim()).filter(Boolean);
                    if (preferredShifts.length > 0 && !preferredShifts.includes(type)) {
                        conflicts[`${cellId}-${chef.id}`] = (conflicts[`${cellId}-${chef.id}`] || []);
                        conflicts[`${cellId}-${chef.id}`].push("Wrong Shift");
                    }
                }
            });
        });
        chefs.forEach(chef => {
            // Only enforce hour limits for CASUAL employees
            if (chef.employmentType === 'CASUAL' && chef.maxWeeklyHours && chefStats[chef.id].hours > chef.maxWeeklyHours) {
                chefStats[chef.id].overLimit = true;
            }
        });
        return { chefStats, conflicts };
    }, [roster, chefs]);

    const handleDragStart = (event) => {
        setActiveChef(event.active.data.current);
    };

    const handleDragEnd = (event) => {
        setActiveChef(null);
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
    const [mobileDay, setMobileDay] = useState(0); // Track which day to show on mobile
    const [showMobileStaff, setShowMobileStaff] = useState(false);

    const autoGenerate = () => {
        const newRoster = {};
        const staffByDay = {};
        const weeklyHours = {};
        chefs.forEach(chef => {
            staffByDay[chef.id] = new Set();
            weeklyHours[chef.id] = 0;
        });

        const getPreferredShifts = (chef) => {
            if (!chef.preferredShift || chef.preferredShift === "") return null; // null = any/flexible
            return chef.preferredShift.split(',').map(s => s.trim()).filter(Boolean);
        };

        const isChefAvailable = (chef, day, shiftType) => {
            // Rest day check
            if (chef.preferredRestDay && chef.preferredRestDay.split(',').map(d => d.trim()).includes(day)) return false;

            // Preferred shift check — applies to ALL staff
            const preferredShifts = getPreferredShifts(chef);
            if (preferredShifts && !preferredShifts.includes(shiftType)) return false;

            // Casual-specific: no double shifts on same day
            if (chef.employmentType === 'CASUAL') {
                if (staffByDay[chef.id].has(day)) return false;
                // Check weekly hour limits for casuals
                if (chef.maxWeeklyHours && weeklyHours[chef.id] + 8 > chef.maxWeeklyHours) return false;
            }

            return true;
        };

        // Shuffle helper for fairer distribution
        const shuffled = (arr) => {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        };

        DAYS.forEach(day => {
            SHIFT_TYPES.forEach(type => {
                const shiftId = `${day}-${type}`;
                const assigned = [];
                const limit = shiftLimits[type] || 0;

                // Shuffle candidates for fairer rotation
                const candidates = shuffled(chefs);

                for (const candidate of candidates) {
                    if (assigned.length >= limit) break;
                    if (isChefAvailable(candidate, day, type)) {
                        assigned.push(candidate);
                        staffByDay[candidate.id].add(day);
                        weeklyHours[candidate.id] += 8;
                    }
                }
                newRoster[shiftId] = assigned;
            });
        });
        setRoster(newRoster);
        setShowAutoSettings(false);
        if (isMobile) setShowMobileStaff(true);
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
            <header style={{ marginBottom: isMobile ? '1rem' : '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem', fontSize: isMobile ? '1.4rem' : '2rem' }}>Weekly Roster</h1>
                        {!isMobile && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Orchestrate your kitchen crew.</p>}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    background: 'rgba(255,255,255,0.03)',
                    padding: isMobile ? '0.5rem' : '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <button className="btn btn-secondary" onClick={handleClear} style={{ flex: '1 1 auto', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        <Trash2 size={14} /> Clear
                    </button>
                    <div style={{ position: 'relative', flex: '1 1 auto' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAutoSettings(!showAutoSettings)} style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                            <Wand2 size={14} /> Auto
                        </button>
                        {showAutoSettings && (
                            <div className="glass-card" style={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                left: isMobile ? 0 : 'auto',
                                width: isMobile ? 'auto' : '280px',
                                zIndex: 100,
                                padding: '1rem',
                                border: '1px solid var(--accent-glow)',
                                background: 'var(--bg-surface-elevated)'
                            }}>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>Auto-Gen Settings</h4>
                                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {Object.entries(shiftLimits).map(([type, limit]) => (
                                        <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.5rem', borderRadius: '8px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>{type === 'PM' ? 'Dinner' : type.charAt(0) + type.slice(1).toLowerCase()}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={limit}
                                                onChange={(e) => setShiftLimits({ ...shiftLimits, [type]: parseInt(e.target.value) || 0 })}
                                                style={{ width: '50px', padding: '4px', textAlign: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }} onClick={autoGenerate}>
                                    Generate
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: '1 1 auto', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        <Save size={14} /> {isSaving ? "Syncing..." : "Publish"}
                    </button>
                </div>
            </header>

            <div className="roster-flex-container" style={{
                display: 'flex',
                gap: isMobile ? '1rem' : '2rem',
                flexDirection: isMobile ? 'column-reverse' : 'row',
                alignItems: 'flex-start'
            }}>
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    {/* ROSTER GRID / LIST */}
                    <div className="glass-card" style={{
                        flex: 1,
                        width: '100%',
                        padding: isMobile ? '0.75rem' : '1.5rem',
                        minHeight: isMobile ? 'auto' : '600px',
                        position: 'relative',
                        background: 'rgba(255,255,255,0.01)'
                    }}>
                        {isMobile ? (
                            // MOBILE VIEW: One day at a time with day navigation
                            <div>
                                {/* Day Selector */}
                                {/* Day Selector - Horizontal Tabs */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '4px',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    {DAYS.map((d, i) => (
                                        <button
                                            key={d}
                                            onClick={() => setMobileDay(i)}
                                            style={{
                                                padding: '0.5rem 0',
                                                borderRadius: '8px',
                                                border: i === mobileDay ? '1px solid var(--accent)' : '1px solid transparent',
                                                background: i === mobileDay ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                                                color: i === mobileDay ? 'var(--accent-dark)' : 'var(--text-secondary)',
                                                fontWeight: i === mobileDay ? '800' : '500',
                                                fontSize: '0.7rem',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span className="desktop-only">{d.slice(0, 3)}</span>
                                            <span className="mobile-only">{d.slice(0, 3)}</span>
                                        </button>
                                    ))}
                                </div>



                                {/* Shifts for selected day */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {SHIFT_TYPES.map(type => {
                                        const day = DAYS[mobileDay];
                                        const cellId = `${day}-${type}`;
                                        return (
                                            <div key={cellId} style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--glass-border)',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    padding: '0.6rem 0.75rem',
                                                    background: 'rgba(212, 175, 55, 0.15)',
                                                    borderBottom: '1px solid var(--accent)',
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)'
                                                }}>
                                                    {type === "MORNING" && <Sun size={14} color="var(--morning)" />}
                                                    {type === "LUNCH" && <Utensils size={14} color="var(--lunch)" />}
                                                    {type === "PM" && <Moon size={14} color="var(--pm)" />}
                                                    {type === "MORNING" ? "Morning" : type === "LUNCH" ? "Lunch" : "Dinner"}
                                                </div>
                                                <div style={{ padding: '0.5rem' }}>
                                                    <RosterCell
                                                        id={cellId}
                                                        shifts={roster[cellId] || []}
                                                        onRemove={removeChefFromCell}
                                                        conflicts={stats.conflicts}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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
                        flexShrink: 0,
                        padding: isMobile ? '0.75rem' : undefined
                    }}>
                        <div
                            onClick={() => isMobile && setShowMobileStaff(!showMobileStaff)}
                            style={{
                                marginBottom: (!isMobile || showMobileStaff) ? '1rem' : 0,
                                fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: isMobile ? 'pointer' : 'default'
                            }}
                        >
                            <h3 style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', margin: 0 }}>Staff Directory ({chefs.length})</h3>
                            {isMobile && (showMobileStaff ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                        </div>
                        {(!isMobile || showMobileStaff) && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                maxHeight: isMobile ? '250px' : 'none',
                                overflowY: isMobile ? 'auto' : 'visible'
                            }}>
                                {chefs.map(chef => (
                                    <div key={chef.id}>
                                        <DraggableChef
                                            chef={chef}
                                            stats={stats.chefStats[chef.id]}
                                            onUpdateMaxHours={async (chefId, newHours) => {
                                                setChefs(prev => prev.map(c => c.id === chefId ? { ...c, maxWeeklyHours: newHours } : c));
                                                try {
                                                    const { updateProfile } = await import('@/app/actions/staff');
                                                    await updateProfile(chefId, { maxWeeklyHours: newHours });
                                                } catch (err) { console.error('Failed to save hours:', err); }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                    <DragOverlay>
                        {activeChef ? (
                            <div style={{
                                background: activeChef.color || 'var(--accent)',
                                padding: '0.75rem 1rem',
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                width: '240px',
                                cursor: 'grabbing'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: activeChef.avatar ? `url(${activeChef.avatar}) center/cover` : 'rgba(0,0,0,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {!activeChef.avatar && <User size={16} color="rgba(255,255,255,0.7)" />}
                                        </div>
                                        <span style={{ fontSize: '1rem' }}>{activeChef.name}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
