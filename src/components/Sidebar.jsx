import { TrendingUp, LayoutDashboard, Briefcase, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
];

export default function Sidebar({ activePage, onNavigate, theme, onToggleTheme }) {
    const isDark = theme === 'dark';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <TrendingUp size={22} />
                <span className="sidebar-logo-text">InvestIQ</span>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`nav-item ${activePage === id ? 'active' : ''}`}
                        onClick={() => onNavigate(id)}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                {/* Animated theme toggle */}
                <button
                    onClick={onToggleTheme}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                        marginBottom: 10, fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s ease',
                    }}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <div style={{
                        width: 36, height: 20, borderRadius: 10, position: 'relative',
                        background: isDark ? 'var(--accent-blue-dim)' : 'var(--accent-gold)',
                        border: `1px solid ${isDark ? 'var(--accent-blue)' : 'var(--accent-gold)'}`,
                        transition: 'all 0.3s ease', flexShrink: 0,
                    }}>
                        <div style={{
                            position: 'absolute', top: 2, left: isDark ? 2 : 16,
                            width: 14, height: 14, borderRadius: '50%',
                            background: isDark ? 'var(--accent-blue)' : '#fff',
                            transition: 'all 0.3s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {isDark
                                ? <Moon size={8} style={{ color: '#0d1117' }} />
                                : <Sun size={8} style={{ color: 'var(--accent-gold)' }} />
                            }
                        </div>
                    </div>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <p>Prices via Yahoo Finance</p>
                <p style={{ marginTop: 4 }}>Data may be delayed 15 min</p>
            </div>
        </aside>
    );
}
