import { useState } from 'react';
import { X, AlertCircle, Target, PlusCircle } from 'lucide-react';

export default function AddAssetModal({ onClose, onAdd, portfolio = [] }) {
    const [ticker, setTicker] = useState('');
    const [type, setType] = useState('Stock');
    const [quantity, setQuantity] = useState('');
    const [avgPrice, setAvgPrice] = useState('');
    const [goalPrice, setGoalPrice] = useState('');
    const [dividend, setDividend] = useState('');
    const [sector, setSector] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Detect existing holding for live duplicate hint
    const existing = ticker.trim().length > 0
        ? portfolio.find(a => a.ticker === ticker.trim().toUpperCase())
        : null;

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!ticker.trim()) return setError('Ticker symbol is required.');
        if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) return setError('Enter a valid quantity.');
        if (!avgPrice || isNaN(avgPrice) || parseFloat(avgPrice) <= 0) return setError('Enter a valid average buy price.');

        setLoading(true);
        try {
            await onAdd({
                ticker: ticker.trim().toUpperCase(),
                type,
                quantity,
                avgPrice,
                goalPrice: goalPrice !== '' ? parseFloat(goalPrice) : null,
                dividend: dividend !== '' ? parseFloat(dividend) : null,
                sector: sector || null,
            });
            onClose();
        } catch {
            setError('Failed to add asset. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Compute what the new average will be (live preview)
    const newQty = parseFloat(quantity) || 0;
    const newPrice = parseFloat(avgPrice) || 0;
    const mergedAvg = existing && newQty > 0 && newPrice > 0
        ? (existing.quantity * existing.avgPrice + newQty * newPrice) / (existing.quantity + newQty)
        : null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{existing ? 'Add More' : 'Add Asset'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* Duplicate hint banner */}
                {existing && (
                    <div style={{
                        background: 'rgba(99,179,237,0.08)',
                        border: '1px solid rgba(99,179,237,0.25)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        marginBottom: 16,
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                    }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <PlusCircle size={12} /> Merging with existing {existing.ticker} position
                        </span>
                        <span>Current: <strong>{existing.quantity.toLocaleString()} shares</strong> @ <strong>${existing.avgPrice.toFixed(2)}</strong></span>
                        {mergedAvg != null && (
                            <span>After merge: <strong>{(existing.quantity + newQty).toLocaleString()} shares</strong> @ <strong>${mergedAvg.toFixed(2)}</strong> avg</span>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Ticker Symbol</label>
                        <input
                            className="form-input"
                            placeholder="e.g. AAPL, BTC-USD, TSLA"
                            value={ticker}
                            onChange={e => setTicker(e.target.value.toUpperCase())}
                            autoFocus
                        />
                    </div>

                    {!existing && (
                        <div className="form-group">
                            <label className="form-label">Asset Type</label>
                            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                                <option value="Stock">Stock</option>
                                <option value="Crypto">Crypto</option>
                                <option value="ETF">ETF</option>
                                <option value="Index">Index</option>
                            </select>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{existing ? 'Additional Quantity' : 'Quantity'}</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="e.g. 10"
                                min="0"
                                step="any"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{existing ? 'Purchase Price (USD)' : 'Avg Buy Price (USD)'}</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="e.g. 150.00"
                                min="0"
                                step="any"
                                value={avgPrice}
                                onChange={e => setAvgPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Target size={12} /> Goal Price (USD)
                            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', marginLeft: 4 }}>— optional{existing ? ', leave blank to keep current' : ''}</span>
                        </label>
                        <input
                            className="form-input"
                            type="number"
                            placeholder={existing?.goalPrice ? `Current: $${existing.goalPrice}` : 'e.g. 200.00 (your target price)'}
                            min="0"
                            step="any"
                            value={goalPrice}
                            onChange={e => setGoalPrice(e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Sector
                                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', marginLeft: 4 }}>— optional</span>
                            </label>
                            <select className="form-select" value={sector} onChange={e => setSector(e.target.value)}>
                                <option value="">Select sector…</option>
                                <option value="Technology">Technology</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Finance">Finance</option>
                                <option value="Energy">Energy</option>
                                <option value="Consumer">Consumer</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Dividend $/share
                                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', marginLeft: 4 }}>— annual</span>
                            </label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="e.g. 0.96"
                                min="0"
                                step="any"
                                value={dividend}
                                onChange={e => setDividend(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading
                                ? 'Updating…'
                                : existing
                                    ? `Merge ${ticker} Position`
                                    : 'Add Asset'}
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    💡 Use Yahoo Finance symbols: <strong>AAPL</strong> (stocks), <strong>BTC-USD</strong> (crypto), <strong>SPY</strong> (ETF)
                </p>
            </div>
        </div>
    );
}
