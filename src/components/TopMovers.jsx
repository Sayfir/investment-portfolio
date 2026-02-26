import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '../services/financeService';

export default function TopMovers({ portfolio }) {
    const withPrice = portfolio.filter(a => a.dayChangePct != null && a.currentPrice != null);
    if (withPrice.length === 0) return null;

    const sorted = [...withPrice].sort((a, b) => (b.dayChangePct ?? 0) - (a.dayChangePct ?? 0));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    function MoverCard({ asset, label, isPositive }) {
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const color = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
        const dimColor = isPositive ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)';

        return (
            <div style={{
                flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '16px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                        {label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{asset.ticker}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatPrice(asset.currentPrice, asset.currency)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: dimColor, color, padding: '4px 10px',
                        borderRadius: 20, fontSize: 13, fontWeight: 700,
                    }}>
                        <Icon size={13} />
                        {isPositive ? '+' : ''}{asset.dayChangePct?.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {isPositive ? '+' : ''}{asset.dayChange?.toFixed(2)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <MoverCard asset={best} label="🏆 Top Gainer" isPositive={best.dayChangePct >= 0} />
            <MoverCard asset={worst} label="📉 Top Loser" isPositive={worst.dayChangePct >= 0} />
        </div>
    );
}
