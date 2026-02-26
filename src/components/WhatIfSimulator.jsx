import { useState, useMemo } from 'react';
import { X, FlaskConical, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatPrice, formatLargeNumber } from '../services/financeService';

const inputStyle = {
    width: '100%', padding: '8px 10px', fontSize: 13,
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
};

export default function WhatIfSimulator({ portfolio, onClose }) {
    const [ticker, setTicker] = useState('');
    const [qty, setQty] = useState('');
    const [price, setPrice] = useState('');

    const simulation = useMemo(() => {
        if (!ticker.trim() || !qty || !price || isNaN(qty) || isNaN(price) || parseFloat(qty) <= 0 || parseFloat(price) <= 0)
            return null;

        const t = ticker.trim().toUpperCase();
        const newQty = parseFloat(qty);
        const newPrice = parseFloat(price);

        const currentTotal = portfolio.reduce((s, a) => s + (a.currentPrice ?? a.avgPrice) * a.quantity, 0);
        const currentCost = portfolio.reduce((s, a) => s + a.avgPrice * a.quantity, 0);

        const existing = portfolio.find(a => a.ticker === t);
        const simCost = newQty * newPrice;
        const simTotal = currentTotal + simCost;
        const simTotalCost = currentCost + simCost;

        const existingAlloc = existing
            ? ((existing.currentPrice ?? existing.avgPrice) * existing.quantity / currentTotal * 100)
            : 0;
        const simVal = existing
            ? ((existing.currentPrice ?? existing.avgPrice) * existing.quantity + simCost)
            : simCost;
        const newAlloc = simTotal > 0 ? (simVal / simTotal * 100) : 0;

        return {
            ticker: t, isNew: !existing, simCost,
            currentTotal, simTotal,
            currentGain: currentTotal - currentCost,
            simGain: simTotal - simTotalCost,
            existingAlloc, newAlloc,
            assetCount: existing ? portfolio.length : portfolio.length + 1,
            valueDiff: simTotal - currentTotal,
            gainDiff: (simTotal - simTotalCost) - (currentTotal - currentCost),
        };
    }, [ticker, qty, price, portfolio]);

    const hasInput = ticker.trim().length > 0;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ width: 480, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                    <FlaskConical size={16} style={{ color: 'var(--accent-purple)', marginRight: 8 }} />
                    <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>What-If Simulator</span>
                    <button className="modal-close" onClick={onClose} style={{ position: 'static' }}><X size={16} /></button>
                </div>

                <div style={{ padding: '14px 18px' }}>
                    {/* Inputs */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        <div style={{ flex: '1 1 110px' }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Ticker</label>
                            <input placeholder="e.g. AAPL" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} style={{ ...inputStyle, fontWeight: 700 }} />
                        </div>
                        <div style={{ flex: '1 1 90px' }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Shares</label>
                            <input placeholder="100" type="number" min="0" step="any" value={qty} onChange={e => setQty(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ flex: '1 1 90px' }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Price</label>
                            <input placeholder="$150" type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    {simulation ? (
                        <>
                            {/* Cost pill */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '8px 0', marginBottom: 12,
                            }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                }}>{simulation.isNew ? 'New position' : 'Add to existing'}</span>
                                <span style={{
                                    fontSize: 16, fontWeight: 800, color: 'var(--accent-purple)',
                                    padding: '2px 12px', borderRadius: 20,
                                    background: 'color-mix(in srgb, var(--accent-purple) 15%, transparent)',
                                }}>{formatPrice(simulation.simCost)}</span>
                            </div>

                            {/* Comparison row */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 28px 1fr', gap: 0,
                                alignItems: 'stretch', marginBottom: 10,
                            }}>
                                <MetricCard
                                    label="Current"
                                    value={formatLargeNumber(simulation.currentTotal)}
                                    gain={simulation.currentGain}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <MetricCard
                                    label="Simulated"
                                    value={formatLargeNumber(simulation.simTotal)}
                                    gain={simulation.simGain}
                                    highlight
                                    diff={`+${formatPrice(simulation.valueDiff)}`}
                                />
                            </div>

                            {/* Allocation bar */}
                            <div style={{
                                padding: '10px 14px', background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {simulation.ticker} allocation
                                    </span>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                                        background: 'var(--accent-purple)', color: '#0d1117',
                                    }}>+{(simulation.newAlloc - simulation.existingAlloc).toFixed(1)}pp</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 42 }}>{simulation.existingAlloc.toFixed(1)}%</span>
                                    <div style={{ flex: 1, position: 'relative', height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0, height: '100%',
                                            width: `${Math.min(simulation.newAlloc, 100)}%`,
                                            background: 'var(--accent-purple)', borderRadius: 3,
                                            opacity: 0.3, transition: 'width 0.3s',
                                        }} />
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0, height: '100%',
                                            width: `${Math.min(simulation.existingAlloc, 100)}%`,
                                            background: 'var(--accent-blue)', borderRadius: 3,
                                            transition: 'width 0.3s',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-purple)', minWidth: 42, textAlign: 'right' }}>
                                        {simulation.newAlloc.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 12,
                        }}>
                            {hasInput ? 'Enter shares and price to simulate…' : 'Enter a ticker to get started'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, gain, highlight, diff }) {
    const isPos = gain >= 0;
    return (
        <div style={{
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: highlight ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
            border: `1px solid ${highlight ? 'var(--accent-purple)' : 'var(--border)'}`,
            textAlign: 'center',
        }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{value}</div>
            <div style={{
                fontSize: 10, fontWeight: 600,
                color: isPos ? 'var(--accent-green)' : 'var(--accent-red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
                {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPos ? '+' : ''}{formatPrice(gain)}
            </div>
            {diff && (
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-green)', marginTop: 2 }}>{diff}</div>
            )}
        </div>
    );
}
