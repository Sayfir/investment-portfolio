import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Clock, Timer } from 'lucide-react';
import { format } from 'date-fns';

const REFRESH_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '30s', value: 30000 },
    { label: '60s', value: 60000 },
    { label: '5m', value: 300000 },
];

function getMarketStatus(now) {
    // US Eastern Time offset: EST = UTC-5, EDT = UTC-4
    // Simple DST check: second Sunday of March to first Sunday of November
    const year = now.getUTCFullYear();
    const marchSecondSunday = new Date(Date.UTC(year, 2, 8));
    marchSecondSunday.setUTCDate(8 + (7 - marchSecondSunday.getUTCDay()) % 7);
    const novFirstSunday = new Date(Date.UTC(year, 10, 1));
    novFirstSunday.setUTCDate(1 + (7 - novFirstSunday.getUTCDay()) % 7);

    const isDST = now >= marchSecondSunday && now < novFirstSunday;
    const etOffset = isDST ? -4 : -5;
    const etHours = (now.getUTCHours() + etOffset + 24) % 24;
    const etMinutes = now.getUTCMinutes();
    const etTime = etHours * 60 + etMinutes;
    const day = new Date(now.getTime() + etOffset * 3600000).getUTCDay();

    const isWeekday = day >= 1 && day <= 5;
    const preMarketOpen = 4 * 60;      // 4:00 AM ET
    const marketOpen = 9 * 60 + 30;    // 9:30 AM ET
    const marketClose = 16 * 60;       // 4:00 PM ET
    const afterHoursClose = 20 * 60;   // 8:00 PM ET

    if (!isWeekday) return { status: 'closed', label: 'Weekend', color: 'var(--text-muted)' };
    if (etTime >= marketOpen && etTime < marketClose) return { status: 'open', label: 'Market Open', color: 'var(--accent-green)' };
    if (etTime >= preMarketOpen && etTime < marketOpen) return { status: 'pre', label: 'Pre-Market', color: 'var(--accent-gold)' };
    if (etTime >= marketClose && etTime < afterHoursClose) return { status: 'after', label: 'After Hours', color: '#bc8cff' };
    return { status: 'closed', label: 'Market Closed', color: 'var(--accent-red)' };
}

export default function Header({ title, onRefresh, isRefreshing, autoRefreshInterval, onSetAutoRefresh }) {
    const [time, setTime] = useState(new Date());
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const currentLabel = REFRESH_OPTIONS.find(o => o.value === autoRefreshInterval)?.label || 'Off';
    const market = useMemo(() => getMarketStatus(time), [time]);

    return (
        <header className="header">
            <h1 className="header-title">{title}</h1>
            <div className="header-right">
                {/* Market status */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 600, padding: '4px 10px',
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                }}>
                    <div style={{
                        width: 7, height: 7, borderRadius: '50%', background: market.color,
                        boxShadow: market.status === 'open' ? `0 0 6px ${market.color}` : 'none',
                        animation: market.status === 'open' ? 'pulse-dot 2s infinite' : 'none',
                    }} />
                    <span style={{ color: market.color }}>{market.label}</span>
                </div>

                <div className="header-time">
                    <Clock size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', opacity: 0.6 }} />
                    {format(time, 'MMM d, yyyy  HH:mm:ss')}
                </div>

                {/* Auto-refresh dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        className="btn btn-icon"
                        onClick={() => setShowDropdown(!showDropdown)}
                        title="Auto-refresh interval"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
                            color: autoRefreshInterval > 0 ? 'var(--accent-green)' : undefined,
                            borderColor: autoRefreshInterval > 0 ? 'var(--accent-green)' : undefined,
                        }}
                    >
                        <Timer size={13} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{currentLabel}</span>
                    </button>

                    {showDropdown && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 6,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                            zIndex: 100, overflow: 'hidden', minWidth: 100,
                        }}>
                            {REFRESH_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onSetAutoRefresh(opt.value); setShowDropdown(false); }}
                                    style={{
                                        display: 'block', width: '100%', padding: '8px 14px',
                                        background: opt.value === autoRefreshInterval ? 'var(--bg-tertiary)' : 'transparent',
                                        border: 'none', color: 'var(--text-primary)', fontSize: 12,
                                        fontWeight: opt.value === autoRefreshInterval ? 700 : 400,
                                        cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                                    }}
                                    onMouseEnter={e => e.target.style.background = 'var(--bg-tertiary)'}
                                    onMouseLeave={e => e.target.style.background = opt.value === autoRefreshInterval ? 'var(--bg-tertiary)' : 'transparent'}
                                >
                                    {opt.label}
                                    {opt.value === autoRefreshInterval && ' ✓'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className={`btn btn-icon ${isRefreshing ? 'spinning' : ''}`}
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Refresh all prices"
                >
                    <RefreshCw size={15} />
                </button>
            </div>
        </header>
    );
}
