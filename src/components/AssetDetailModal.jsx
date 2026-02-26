import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Target, DollarSign, BarChart2, Layers, Calendar, Bell, BellOff, PlusCircle, Trash2 } from 'lucide-react';
import { formatPrice } from '../services/financeService';

function DetailRow({ label, value, icon: Icon, color }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
        }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                {Icon && <Icon size={14} style={{ color: color || 'var(--text-muted)' }} />}
                {label}
            </span>
            <span style={{ fontWeight: 600, fontSize: 13, color: color || 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

function GoalProgressFull({ currentPrice, avgPrice, goalPrice }) {
    if (goalPrice == null || currentPrice == null) {
        return <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>No goal set</div>;
    }

    const range = goalPrice - avgPrice;
    const moved = currentPrice - avgPrice;
    const pct = range === 0 ? (currentPrice >= goalPrice ? 100 : 0) : (moved / range) * 100;
    const reached = pct >= 100;
    const isNeg = pct < 0;

    const barWidth = Math.min(100, Math.max(0, pct));
    const barColor = reached ? 'var(--accent-green)' : isNeg ? 'var(--accent-red)' : 'var(--accent-blue)';
    const pctColor = reached ? 'var(--accent-green)' : isNeg ? 'var(--accent-red)' : 'var(--accent-blue)';

    const distToGoal = goalPrice - currentPrice;
    const distPct = currentPrice > 0 ? ((distToGoal / currentPrice) * 100).toFixed(2) : 0;

    return (
        <div style={{
            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
            padding: 16, marginTop: 8,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <Target size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
                    Goal Progress
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: pctColor }}>{pct.toFixed(1)}%</span>
            </div>

            <div style={{
                height: 8, background: 'var(--bg-primary)', borderRadius: 4,
                overflow: 'hidden', marginBottom: 12,
            }}>
                {isNeg ? (
                    <div style={{ width: `${Math.min(100, Math.abs(pct))}%`, height: '100%', background: 'var(--accent-red)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                ) : (
                    <div style={{ width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Buy Price</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{formatPrice(avgPrice)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Current</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: currentPrice >= avgPrice ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatPrice(currentPrice)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Goal</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>{formatPrice(goalPrice)}</div>
                </div>
            </div>

            {!reached && (
                <div style={{
                    marginTop: 12, textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)',
                    background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '6px 10px',
                }}>
                    {distToGoal > 0
                        ? `${formatPrice(distToGoal)} to go (${distPct}% away)`
                        : `Exceeded goal by ${formatPrice(Math.abs(distToGoal))}`}
                </div>
            )}
        </div>
    );
}

function AlertsSection({ ticker, alerts, onAddAlert, onRemoveAlert }) {
    const [showAdd, setShowAdd] = useState(false);
    const [alertPrice, setAlertPrice] = useState('');
    const [alertDir, setAlertDir] = useState('above');

    const tickerAlerts = alerts?.filter(a => a.ticker === ticker) || [];

    function handleAdd() {
        if (!alertPrice || isNaN(alertPrice)) return;
        onAddAlert(ticker, parseFloat(alertPrice), alertDir);
        setAlertPrice('');
        setShowAdd(false);
    }

    return (
        <div style={{
            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
            padding: 16, marginTop: 8,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tickerAlerts.length > 0 || showAdd ? 12 : 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <Bell size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
                    Price Alerts
                </span>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '3px 8px', cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, color: 'var(--accent-blue)', fontFamily: 'Inter, sans-serif',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}
                >
                    <PlusCircle size={11} /> Add Alert
                </button>
            </div>

            {showAdd && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
                    <select
                        value={alertDir}
                        onChange={e => setAlertDir(e.target.value)}
                        style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', padding: '5px 8px', fontSize: 11,
                            color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
                        }}
                    >
                        <option value="above">Above</option>
                        <option value="below">Below</option>
                    </select>
                    <input
                        autoFocus
                        type="number"
                        placeholder="Price"
                        step="any"
                        min="0"
                        value={alertPrice}
                        onChange={e => setAlertPrice(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        style={{
                            flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', padding: '5px 8px', fontSize: 12,
                            color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleAdd}
                        style={{
                            background: 'var(--accent-green)', border: 'none', borderRadius: 'var(--radius-sm)',
                            padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#0d1117',
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        }}
                    >Set</button>
                </div>
            )}

            {tickerAlerts.map(alert => (
                <div key={alert.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                    marginBottom: 4, fontSize: 12,
                }}>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: alert.active ? 'var(--text-primary)' : 'var(--text-muted)',
                        textDecoration: alert.active ? 'none' : 'line-through',
                    }}>
                        {alert.active ? <Bell size={11} style={{ color: 'var(--accent-gold)' }} /> : <BellOff size={11} />}
                        {alert.direction === 'above' ? '↑' : '↓'} {formatPrice(alert.targetPrice)}
                        {!alert.active && <span style={{ fontSize: 10, color: 'var(--accent-green)' }}> (triggered)</span>}
                    </span>
                    <button
                        onClick={() => onRemoveAlert(alert.id)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: 2,
                        }}
                    >
                        <Trash2 size={11} />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function AssetDetailModal({ asset, onClose, alerts, onAddAlert, onRemoveAlert }) {
    if (!asset) return null;

    const price = asset.currentPrice;
    const cost = asset.avgPrice * asset.quantity;
    const totalVal = price != null ? price * asset.quantity : cost;
    const gain = price != null ? totalVal - cost : null;
    const gainPct = cost && gain != null ? (gain / cost) * 100 : null;
    const gainPositive = (gain ?? 0) >= 0;
    const dayPositive = (asset.dayChange ?? 0) >= 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ width: 500, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {asset.ticker}
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                                textTransform: 'uppercase', letterSpacing: 0.5,
                                background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)',
                            }}>{asset.type}</span>
                            {asset.sector && (
                                <span style={{
                                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                                    background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                                }}>{asset.sector}</span>
                            )}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{asset.name}</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* Price header */}
                <div style={{
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    padding: '16px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Current Price</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{price != null ? formatPrice(price, asset.currency) : 'N/A'}</div>
                    </div>
                    {asset.dayChange != null && (
                        <span className={`change-pill ${dayPositive ? 'change-up' : 'change-down'}`} style={{ fontSize: 13, padding: '4px 10px' }}>
                            {dayPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {dayPositive ? '+' : ''}{asset.dayChange.toFixed(2)} ({dayPositive ? '+' : ''}{asset.dayChangePct.toFixed(2)}%)
                        </span>
                    )}
                </div>

                {/* Details */}
                <div style={{ marginBottom: 8 }}>
                    <DetailRow label="Quantity" value={asset.quantity.toLocaleString('en-US', { maximumFractionDigits: 2 })} icon={Layers} />
                    <DetailRow label="Avg Buy Price" value={formatPrice(asset.avgPrice, asset.currency)} icon={DollarSign} />
                    <DetailRow label="Total Value" value={formatPrice(totalVal, asset.currency)} icon={BarChart2} color="var(--accent-blue)" />
                    <DetailRow label="Total Cost" value={formatPrice(cost, asset.currency)} icon={DollarSign} />
                    <DetailRow
                        label="Gain / Loss"
                        value={gain != null ? `${gainPositive ? '+' : ''}${formatPrice(gain, asset.currency)} (${gainPositive ? '+' : ''}${gainPct.toFixed(2)}%)` : '—'}
                        icon={gainPositive ? TrendingUp : TrendingDown}
                        color={gainPositive ? 'var(--accent-green)' : 'var(--accent-red)'}
                    />
                    {asset.preMarketPrice != null && (
                        <DetailRow
                            label="Pre-Market"
                            value={`${formatPrice(asset.preMarketPrice, asset.currency)} (${asset.preMarketChangePct >= 0 ? '+' : ''}${asset.preMarketChangePct.toFixed(2)}%)`}
                            icon={Calendar}
                            color={asset.preMarketChangePct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
                        />
                    )}
                    {asset.dividend != null && asset.dividend > 0 && (
                        <DetailRow
                            label="Dividend"
                            value={`${formatPrice(asset.dividend)}/share · ${formatPrice(asset.dividend * asset.quantity)}/yr`}
                            icon={DollarSign}
                            color="var(--accent-gold)"
                        />
                    )}
                </div>

                {/* Goal progress */}
                <GoalProgressFull
                    currentPrice={price}
                    avgPrice={asset.avgPrice}
                    goalPrice={asset.goalPrice}
                />

                {/* Price alerts */}
                <AlertsSection
                    ticker={asset.ticker}
                    alerts={alerts}
                    onAddAlert={onAddAlert}
                    onRemoveAlert={onRemoveAlert}
                />
            </div>
        </div>
    );
}
