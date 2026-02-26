import { DollarSign } from 'lucide-react';
import { formatPrice } from '../services/financeService';

export default function DividendSummary({ portfolio }) {
    const withDividend = portfolio.filter(a => a.dividend && a.dividend > 0);
    if (withDividend.length === 0) return null;

    const totalAnnual = withDividend.reduce((sum, a) => sum + (a.dividend * a.quantity), 0);
    const monthlyIncome = totalAnnual / 12;

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                    fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <DollarSign size={16} style={{ color: 'var(--accent-gold)' }} />
                    Dividend Income
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{withDividend.length} dividend-paying asset{withDividend.length !== 1 ? 's' : ''}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    padding: '14px 16px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Annual Income</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-green)' }}>{formatPrice(totalAnnual)}</div>
                </div>
                <div style={{
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    padding: '14px 16px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Monthly Income</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-green)' }}>{formatPrice(monthlyIncome)}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {withDividend.sort((a, b) => (b.dividend * b.quantity) - (a.dividend * a.quantity)).map(a => {
                    const annual = a.dividend * a.quantity;
                    const yieldPct = a.currentPrice ? ((a.dividend / a.currentPrice) * 100).toFixed(2) : '—';
                    return (
                        <div key={a.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                            fontSize: 12,
                        }}>
                            <div>
                                <span style={{ fontWeight: 700 }}>{a.ticker}</span>
                                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{formatPrice(a.dividend)}/share</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Yield: {yieldPct}%</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{formatPrice(annual)}/yr</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
