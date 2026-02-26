import { useState, useRef } from 'react';
import { Target, Edit2, Check, X, TrendingUp, Flag } from 'lucide-react';
import { formatLargeNumber } from '../services/financeService';

/**
 * Large portfolio-level progress bar with milestone labels.
 * Supports both positive and negative (portfolio below starting point) cases.
 */
function PortfolioProgressBar({ currentValue, goalValue }) {
    if (!goalValue || goalValue <= 0) return null;

    const pct = Math.min(100, Math.max(0, (currentValue / goalValue) * 100));
    const reached = currentValue >= goalValue;
    const remaining = goalValue - currentValue;

    // Milestone markers at 25%, 50%, 75%
    const milestones = [25, 50, 75];

    return (
        <div style={{ marginTop: 6 }}>
            {/* Labels row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8, color: 'var(--text-secondary)' }}>
                <span>$0</span>
                {milestones.map(m => (
                    <span key={m} style={{ color: pct >= m ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {formatLargeNumber((goalValue * m) / 100)}
                    </span>
                ))}
                <span style={{ color: reached ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: reached ? 700 : 400 }}>
                    {formatLargeNumber(goalValue)} 🏁
                </span>
            </div>

            {/* Track */}
            <div style={{
                height: 10,
                background: 'var(--bg-tertiary)',
                borderRadius: 6,
                overflow: 'visible',
                position: 'relative',
                border: '1px solid var(--border)',
            }}>
                {/* Fill */}
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: reached
                        ? 'linear-gradient(90deg, var(--accent-green), #56d364)'
                        : `linear-gradient(90deg, var(--accent-blue), #79c0ff)`,
                    borderRadius: 6,
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: reached ? '0 0 12px rgba(57,211,83,0.5)' : '0 0 8px rgba(88,166,255,0.3)',
                    position: 'relative',
                }}>
                    {/* Glow tip */}
                    {pct > 2 && (
                        <div style={{
                            position: 'absolute',
                            right: -1,
                            top: -2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: reached ? 'var(--accent-green)' : 'var(--accent-blue)',
                            border: '2px solid var(--bg-primary)',
                            boxShadow: reached ? '0 0 8px rgba(57,211,83,0.8)' : '0 0 8px rgba(88,166,255,0.8)',
                        }} />
                    )}
                </div>

                {/* Milestone tick marks */}
                {milestones.map(m => (
                    <div key={m} style={{
                        position: 'absolute',
                        left: `${m}%`,
                        top: -3,
                        bottom: -3,
                        width: 1,
                        background: pct >= m ? 'rgba(255,255,255,0.15)' : 'var(--border)',
                    }} />
                ))}
            </div>

            {/* Status row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 10, alignItems: 'center' }}>
                <div>
                    <span style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: reached ? 'var(--accent-green)' : 'var(--text-primary)',
                    }}>
                        {pct.toFixed(1)}%
                    </span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>of goal reached</span>
                </div>
                {!reached ? (
                    <span style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: reached ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                            {formatLargeNumber(remaining)}
                        </span>
                        {' '}still needed
                    </span>
                ) : (
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 13 }}>
                        🎉 Portfolio goal reached!
                    </span>
                )}
            </div>
        </div>
    );
}

export default function PortfolioGoalCard({ totalValue, portfolioGoal, onSetGoal }) {
    const [editing, setEditing] = useState(false);
    const [inputVal, setInputVal] = useState(portfolioGoal != null ? String(portfolioGoal) : '');
    const inputRef = useRef(null);

    function startEdit() {
        setInputVal(portfolioGoal != null ? String(portfolioGoal) : '');
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    }

    function save() {
        onSetGoal(inputVal !== '' ? inputVal : null);
        setEditing(false);
    }

    function cancel() {
        setInputVal(portfolioGoal != null ? String(portfolioGoal) : '');
        setEditing(false);
    }

    return (
        <div className="card" style={{
            '--card-accent': portfolioGoal && totalValue >= portfolioGoal
                ? 'var(--accent-green)'
                : 'var(--accent-purple)',
            marginBottom: 24,
            padding: '22px 26px',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                    <div className="card-label" style={{ marginBottom: 4 }}>
                        <Flag size={12} />
                        Portfolio Goal
                    </div>
                    {portfolioGoal != null ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                                {formatLargeNumber(totalValue)}
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                / {formatLargeNumber(portfolioGoal)}
                            </span>
                        </div>
                    ) : (
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
                            No portfolio goal set yet
                        </div>
                    )}
                </div>

                {/* Edit / Set goal button */}
                {!editing ? (
                    <button
                        className="btn btn-ghost"
                        style={{ gap: 6, fontSize: 12 }}
                        onClick={startEdit}
                    >
                        <Edit2 size={12} />
                        {portfolioGoal != null ? 'Edit goal' : 'Set goal'}
                    </button>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)',
                                fontSize: 13,
                                pointerEvents: 'none',
                            }}>$</span>
                            <input
                                ref={inputRef}
                                type="number"
                                min="0"
                                step="any"
                                className="form-input"
                                style={{ paddingLeft: 22, width: 140, height: 32, fontSize: 13 }}
                                placeholder="e.g. 100000"
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                            />
                        </div>
                        <button
                            className="btn btn-icon"
                            style={{ padding: '5px 8px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)', height: 32 }}
                            onClick={save}
                            title="Save goal"
                        >
                            <Check size={13} />
                        </button>
                        <button
                            className="btn btn-icon"
                            style={{ padding: '5px 8px', height: 32 }}
                            onClick={cancel}
                            title="Cancel"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* Progress bar (shown when goal is set) */}
            {portfolioGoal != null ? (
                <PortfolioProgressBar currentValue={totalValue} goalValue={portfolioGoal} />
            ) : (
                <div style={{
                    padding: '14px 0 2px',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    <Target size={12} />
                    Click "Set goal" to define your total portfolio target value
                </div>
            )}
        </div>
    );
}
