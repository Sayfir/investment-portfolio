import { useState } from 'react';
import { Trash2, RefreshCw, TrendingUp, TrendingDown, Minus, Target, Check, X, Edit2 } from 'lucide-react';
import { formatPrice, formatLargeNumber } from '../services/financeService';
import AssetDetailModal from './AssetDetailModal';

function TypeBadge({ type }) {
    const cls = type === 'Crypto' ? 'type-crypto' : type === 'ETF' ? 'type-etf' : 'type-stock';
    return <span className={`type-badge ${cls}`}>{type}</span>;
}

function ChangeCell({ value, pct }) {
    if (value == null) return <span className="neutral">—</span>;
    const up = value >= 0;
    const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
    return (
        <span className={`change-pill ${up ? 'change-up' : 'change-down'}`}>
            <Icon size={11} />
            {up ? '+' : ''}{value.toFixed(2)}
            {pct != null ? ` (${up ? '+' : ''}${pct.toFixed(2)}%)` : ''}
        </span>
    );
}

/**
 * Goal progress bar with negative support.
 * - If currentPrice >= goalPrice: 100% (fully green)
 * - If currentPrice < avgPrice (behind buy price): negative red portion
 * - else: partial green progress between avgPrice and goalPrice
 */
function GoalProgressBar({ currentPrice, avgPrice, goalPrice }) {
    if (goalPrice == null || currentPrice == null) return null;

    // Total range from avgPrice to goal
    const range = goalPrice - avgPrice;
    // How far we've moved from avgPrice
    const moved = currentPrice - avgPrice;

    let pct;
    let label;
    let barColor;
    let negPct = 0; // negative (red) portion width %
    let posPct = 0; // positive (green) portion width %

    if (range === 0) {
        pct = currentPrice >= goalPrice ? 100 : 0;
    } else {
        pct = (moved / range) * 100;
    }

    const reached = currentPrice >= goalPrice && range > 0;
    const shortReached = currentPrice <= goalPrice && range < 0;

    if (pct < 0) {
        // Negative: price went the wrong way
        negPct = Math.min(50, Math.abs(pct) / 2); // cap at 50% visually
        posPct = 0;
        barColor = 'var(--accent-red)';
        label = `${pct.toFixed(1)}%`;
    } else {
        negPct = 0;
        posPct = Math.min(100, pct); // bar width capped at 100% visually
        barColor = (reached || shortReached) ? 'var(--accent-green)' : 'var(--accent-blue)';
        label = `${pct.toFixed(1)}%`;
    }

    return (
        <div style={{ minWidth: 130 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4, color: pct < 0 ? 'var(--accent-red)' : (reached || shortReached) ? 'var(--accent-green)' : 'var(--accent-blue)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Target size={9} /> {label}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{formatPrice(goalPrice)}</span>
            </div>
            <div style={{
                height: 5,
                background: 'var(--bg-tertiary)',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                position: 'relative',
            }}>
                {pct < 0 ? (
                    /* Negative case: red bar from center going left */
                    <>
                        <div style={{ flex: 1, background: 'transparent' }} />
                        <div style={{
                            position: 'absolute',
                            right: '50%',
                            top: 0, bottom: 0,
                            width: `${negPct}%`,
                            background: 'var(--accent-red)',
                            borderRadius: '3px 0 0 3px',
                            transition: 'width 0.5s ease',
                        }} />
                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
                    </>
                ) : (
                    /* Positive case: colored fill from left */
                    <div style={{
                        width: `${posPct}%`,
                        background: barColor,
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                    }} />
                )}
            </div>
        </div>
    );
}

/** Inline goal editor shown in table row */
function GoalEditor({ asset, onUpdateGoal }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(asset.goalPrice != null ? String(asset.goalPrice) : '');

    function save() {
        onUpdateGoal(asset.id, val !== '' ? val : null);
        setEditing(false);
    }

    function cancel() {
        setVal(asset.goalPrice != null ? String(asset.goalPrice) : '');
        setEditing(false);
    }

    if (editing) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 160 }}>
                <input
                    autoFocus
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    style={{ padding: '3px 7px', fontSize: 12, width: 90, height: 26 }}
                    placeholder="Target price"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                />
                <button className="btn btn-icon" style={{ padding: '3px 6px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }} onClick={save} title="Save goal">
                    <Check size={11} />
                </button>
                <button className="btn btn-icon" style={{ padding: '3px 6px' }} onClick={cancel} title="Cancel">
                    <X size={11} />
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <GoalProgressBar
                currentPrice={asset.currentPrice}
                avgPrice={asset.avgPrice}
                goalPrice={asset.goalPrice}
            />
            <button
                className="btn btn-ghost"
                style={{ padding: '2px 7px', fontSize: 11, gap: 4, width: 'fit-content' }}
                onClick={() => setEditing(true)}
                title={asset.goalPrice != null ? 'Edit goal' : 'Set goal'}
            >
                <Edit2 size={10} />
                {asset.goalPrice != null ? 'Edit goal' : 'Set goal'}
            </button>
        </div>
    );
}

export default function PortfolioTable({ portfolio, onRemove, onRefreshAsset, onUpdateGoal, alerts, onAddAlert, onRemoveAlert }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Collect unique types and sectors for filter pills
    const types = ['All', ...new Set(portfolio.map(a => a.type))];
    const sectors = [...new Set(portfolio.filter(a => a.sector).map(a => a.sector))];
    const filterOptions = [...types, ...sectors.filter(s => !types.includes(s))];

    // Filter
    const filtered = portfolio.filter(a => {
        const q = search.toLowerCase();
        const matchesSearch = !q || a.ticker.toLowerCase().includes(q) || (a.name || '').toLowerCase().includes(q);
        const matchesFilter = filter === 'All' || a.type === filter || a.sector === filter;
        return matchesSearch && matchesFilter;
    });

    const sortedPortfolio = [...filtered].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'totalValue') {
            aVal = (a.currentPrice ?? a.avgPrice) * a.quantity;
            bVal = (b.currentPrice ?? b.avgPrice) * b.quantity;
        } else if (sortConfig.key === 'gain') {
            const costA = a.avgPrice * a.quantity;
            aVal = a.currentPrice != null ? ((a.currentPrice * a.quantity) - costA) : -Infinity;
            const costB = b.avgPrice * b.quantity;
            bVal = b.currentPrice != null ? ((b.currentPrice * b.quantity) - costB) : -Infinity;
        } else if (sortConfig.key === 'goalProgress') {
            aVal = a.goalPrice ?? -Infinity;
            bVal = b.goalPrice ?? -Infinity;
        } else if (sortConfig.key === 'ticker' || sortConfig.key === 'type') {
            aVal = aVal?.toLowerCase() || '';
            bVal = bVal?.toLowerCase() || '';
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }

        if (aVal == null) aVal = -Infinity;
        if (bVal == null) bVal = -Infinity;

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    const totalValue = portfolio.reduce((s, a) => {
        const price = a.currentPrice ?? a.avgPrice;
        return s + price * a.quantity;
    }, 0);

    return (
        <>
            <div className="table-section">
                <div className="table-header">
                    <div className="table-header-left">
                        <span className="table-title">Holdings</span>
                        <span className="badge">{filtered.length}{filtered.length !== portfolio.length ? ` / ${portfolio.length}` : ''} asset{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                    {totalValue > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Total: <strong style={{ color: 'var(--text-primary)' }}>{formatLargeNumber(totalValue)}</strong>
                        </span>
                    )}
                </div>

                {/* Search + Filter bar */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by ticker or name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            flex: '1 1 200px', padding: '7px 12px', fontSize: 12,
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                            outline: 'none', fontFamily: 'Inter, sans-serif',
                        }}
                    />
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {filterOptions.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(filter === f ? 'All' : f)}
                                style={{
                                    padding: '4px 10px', fontSize: 11, fontWeight: 600,
                                    border: '1px solid var(--border)', borderRadius: 20,
                                    background: filter === f ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                                    color: filter === f ? '#0d1117' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="table-wrapper">
                    {portfolio.length === 0 ? (
                        <div className="empty-state">
                            <TrendingUp size={36} style={{ opacity: 0.2 }} />
                            <h3>No assets yet</h3>
                            <p>Click "+ Add Asset" to start tracking your portfolio</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('ticker')} style={{ cursor: 'pointer' }}>Asset<SortIcon columnKey="ticker" /></th>
                                    <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type<SortIcon columnKey="type" /></th>
                                    <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>Qty<SortIcon columnKey="quantity" /></th>
                                    <th onClick={() => handleSort('avgPrice')} style={{ cursor: 'pointer' }}>Avg Buy<SortIcon columnKey="avgPrice" /></th>
                                    <th onClick={() => handleSort('currentPrice')} style={{ cursor: 'pointer' }}>Current Price<SortIcon columnKey="currentPrice" /></th>
                                    <th onClick={() => handleSort('preMarketChangePct')} style={{ cursor: 'pointer' }}>Pre-Market<SortIcon columnKey="preMarketChangePct" /></th>
                                    <th onClick={() => handleSort('dayChangePct')} style={{ cursor: 'pointer' }}>Day Change<SortIcon columnKey="dayChangePct" /></th>
                                    <th onClick={() => handleSort('totalValue')} style={{ cursor: 'pointer' }}>Total Value<SortIcon columnKey="totalValue" /></th>
                                    <th onClick={() => handleSort('gain')} style={{ cursor: 'pointer' }}>Gain / Loss<SortIcon columnKey="gain" /></th>
                                    <th onClick={() => handleSort('goalProgress')} style={{ cursor: 'pointer' }}>Goal Progress<SortIcon columnKey="goalProgress" /></th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPortfolio.map((asset) => {
                                    const price = asset.currentPrice;
                                    const totalVal = price != null
                                        ? price * asset.quantity
                                        : asset.avgPrice * asset.quantity;
                                    const cost = asset.avgPrice * asset.quantity;
                                    const gain = price != null ? totalVal - cost : null;
                                    const gainPct = cost && gain != null ? (gain / cost) * 100 : null;

                                    return (
                                        <tr key={asset.id} className="asset-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedAsset(asset)}>
                                            <td>
                                                <div className="asset-symbol">{asset.ticker}</div>
                                                <div className="asset-name">{asset.name !== asset.ticker ? asset.name : ''}</div>
                                            </td>
                                            <td><TypeBadge type={asset.type} /></td>
                                            <td>{asset.quantity.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                                            <td>{formatPrice(asset.avgPrice, asset.currency)}</td>
                                            <td>
                                                {asset.priceLoading ? (
                                                    <span className="skeleton" style={{ width: 70, height: 14 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                ) : price != null ? (
                                                    formatPrice(price, asset.currency)
                                                ) : (
                                                    <span className="price-loading">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                {asset.priceLoading ? (
                                                    <span className="skeleton" style={{ width: 60, height: 14 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                ) : asset.preMarketChangePct != null ? (
                                                    <span className={`change-pill ${asset.preMarketChangePct >= 0 ? 'change-up' : 'change-down'}`} title={`Pre-market price: ${asset.preMarketPrice != null ? formatPrice(asset.preMarketPrice, asset.currency) : '—'}`}>
                                                        {asset.preMarketChangePct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                                        {asset.preMarketChangePct >= 0 ? '+' : ''}{asset.preMarketChangePct.toFixed(2)}%
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                {asset.priceLoading ? (
                                                    <span className="skeleton" style={{ width: 80, height: 14 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                ) : (
                                                    <ChangeCell value={asset.dayChange} pct={asset.dayChangePct} />
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {formatPrice(totalVal, asset.currency)}
                                            </td>
                                            <td>
                                                {gain != null ? (
                                                    <span className={gain >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 600 }}>
                                                        {gain >= 0 ? '+' : ''}{formatPrice(gain, asset.currency)}
                                                        <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, opacity: 0.8 }}>
                                                            ({gainPct >= 0 ? '+' : ''}{gainPct?.toFixed(2)}%)
                                                        </span>
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <GoalEditor asset={asset} onUpdateGoal={onUpdateGoal} />
                                            </td>
                                            <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                    <button
                                                        className={`btn btn-icon ${asset.priceLoading ? 'spinning' : ''}`}
                                                        onClick={() => onRefreshAsset(asset.id)}
                                                        disabled={asset.priceLoading}
                                                        title="Refresh price"
                                                        style={{ padding: '5px 7px' }}
                                                    >
                                                        <RefreshCw size={12} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => onRemove(asset.id)}
                                                        title="Remove asset"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedAsset && (
                <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} alerts={alerts} onAddAlert={onAddAlert} onRemoveAlert={onRemoveAlert} />
            )}
        </>
    );
}
