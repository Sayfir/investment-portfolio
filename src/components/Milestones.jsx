import { useMemo } from 'react';
import { Trophy, Star, TrendingUp, ShieldCheck, Layers, DollarSign } from 'lucide-react';
import { formatLargeNumber } from '../services/financeService';

const MILESTONES = [
    { id: 'first_asset', label: 'First Steps', desc: 'Add your first asset', icon: Star, color: '#58a6ff', check: (p) => p.length >= 1 },
    { id: 'five_assets', label: 'Diversifying', desc: 'Hold 5+ assets', icon: Layers, color: '#bc8cff', check: (p) => p.length >= 5 },
    { id: 'ten_assets', label: 'Portfolio Builder', desc: 'Hold 10+ assets', icon: Layers, color: '#39d353', check: (p) => p.length >= 10 },
    { id: 'fifteen_assets', label: 'Collector', desc: 'Hold 15+ assets', icon: Layers, color: '#f0c040', check: (p) => p.length >= 15 },
    { id: 'val_1k', label: 'Getting Started', desc: 'Portfolio reaches $1K', icon: DollarSign, color: '#8b949e', check: (p, v) => v >= 1000 },
    { id: 'val_5k', label: 'Growing', desc: 'Portfolio reaches $5K', icon: DollarSign, color: '#79c0ff', check: (p, v) => v >= 5000 },
    { id: 'val_10k', label: 'Five Figures', desc: 'Portfolio reaches $10K', icon: TrendingUp, color: '#58a6ff', check: (p, v) => v >= 10000 },
    { id: 'val_25k', label: 'Serious Investor', desc: 'Portfolio reaches $25K', icon: TrendingUp, color: '#bc8cff', check: (p, v) => v >= 25000 },
    { id: 'val_50k', label: 'Half Century', desc: 'Portfolio reaches $50K', icon: Trophy, color: '#f0c040', check: (p, v) => v >= 50000 },
    { id: 'val_100k', label: 'Six Figures', desc: 'Portfolio reaches $100K', icon: Trophy, color: '#39d353', check: (p, v) => v >= 100000 },
    { id: 'green_port', label: 'In The Green', desc: 'All assets profitable', icon: ShieldCheck, color: '#39d353', check: (p) => p.length > 0 && p.every(a => a.currentPrice && a.currentPrice >= a.avgPrice) },
    { id: 'multi_sector', label: 'Sector Spread', desc: 'Invest in 3+ sectors', icon: Layers, color: '#ff7b72', check: (p) => new Set(p.filter(a => a.sector).map(a => a.sector)).size >= 3 },
];

export default function Milestones({ portfolio, totalValue }) {
    const results = useMemo(() => {
        return MILESTONES.map(m => ({
            ...m,
            unlocked: m.check(portfolio, totalValue),
        }));
    }, [portfolio, totalValue]);

    const unlocked = results.filter(r => r.unlocked);
    const locked = results.filter(r => !r.unlocked);

    if (portfolio.length === 0) return null;

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
        }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={16} style={{ color: 'var(--accent-gold)' }} />
                Achievements
                <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: 'var(--accent-green-dim)', color: 'var(--accent-green)',
                    marginLeft: 'auto',
                }}>{unlocked.length} / {MILESTONES.length}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {unlocked.map(m => {
                    const Icon = m.icon;
                    return (
                        <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            fontSize: 12, minWidth: 160,
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: `color-mix(in srgb, ${m.color} 20%, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Icon size={14} style={{ color: m.color }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.label}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.desc}</div>
                            </div>
                        </div>
                    );
                })}
                {locked.map(m => {
                    const Icon = m.icon;
                    return (
                        <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                            fontSize: 12, opacity: 0.4, minWidth: 160,
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--bg-tertiary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{m.label}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
