import { useRef, useEffect, useState } from 'react';
import { PieChart } from 'lucide-react';
import { formatPrice } from '../services/financeService';

const SECTOR_COLORS = {
    Technology: '#58a6ff',
    Healthcare: '#39d353',
    Finance: '#f0c040',
    Energy: '#f85149',
    Consumer: '#bc8cff',
    Industrial: '#ff7b72',
    'Real Estate': '#79c0ff',
    Other: '#8b949e',
};

export default function SectorChart({ portfolio }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [hoveredIdx, setHoveredIdx] = useState(-1);
    const withSector = portfolio.filter(a => a.sector);
    const useSectors = withSector.length > 0;

    if (portfolio.length === 0) return null;

    // Aggregate by sector or ticker
    const sectorData = {};
    const tickerColors = ['#58a6ff', '#39d353', '#f0c040', '#f85149', '#bc8cff', '#ff7b72', '#79c0ff', '#8b949e', '#d2a8ff', '#7ee787', '#ffa657', '#f778ba', '#a5d6ff', '#56d4dd', '#fab387', '#cba6f7'];

    for (const a of portfolio) {
        const price = a.currentPrice ?? a.avgPrice;
        const val = price * a.quantity;
        const key = useSectors ? (a.sector || 'Other') : a.ticker;
        if (!sectorData[key]) sectorData[key] = 0;
        sectorData[key] += val;
    }

    const total = Object.values(sectorData).reduce((s, v) => s + v, 0);
    const sectors = Object.entries(sectorData)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], i) => ({
            name,
            value,
            pct: total > 0 ? (value / total * 100) : 0,
            color: useSectors ? (SECTOR_COLORS[name] || SECTOR_COLORS.Other) : tickerColors[i % tickerColors.length],
        }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 200;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const outerR = 90;
        const innerR = 58;

        ctx.clearRect(0, 0, size, size);

        let startAngle = -Math.PI / 2;
        sectors.forEach((s, i) => {
            const sweep = (s.pct / 100) * Math.PI * 2;
            const isHovered = i === hoveredIdx;
            const explode = isHovered ? 6 : 0;
            const midAngle = startAngle + sweep / 2;
            const offX = Math.cos(midAngle) * explode;
            const offY = Math.sin(midAngle) * explode;

            ctx.beginPath();
            ctx.arc(cx + offX, cy + offY, isHovered ? outerR + 3 : outerR, startAngle, startAngle + sweep);
            ctx.arc(cx + offX, cy + offY, innerR, startAngle + sweep, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = s.color;
            ctx.globalAlpha = isHovered ? 1 : (hoveredIdx >= 0 ? 0.5 : 0.85);
            ctx.fill();
            ctx.globalAlpha = 1;
            startAngle += sweep;
        });

        // Center total
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#e6edf3';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOTAL', cx, cy - 6);
        ctx.font = '800 16px Inter, sans-serif';
        ctx.fillText(formatPrice(total), cx, cy + 14);
    });

    return (
        <div
            ref={containerRef}
            style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
                width: '100%',
            }}
        >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={16} style={{ color: 'var(--accent-blue)' }} />
                {useSectors ? 'Sector Allocation' : 'Portfolio Allocation'}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {sectors.length} {useSectors ? 'sectors' : 'assets'}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <canvas ref={canvasRef} style={{ flexShrink: 0 }} />

                <div style={{
                    flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 4,
                    maxHeight: 260, overflowY: 'auto',
                }}>
                    {sectors.map((s, i) => (
                        <div
                            key={s.name}
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(-1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
                                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                background: hoveredIdx === i ? 'var(--bg-tertiary)' : 'transparent',
                                cursor: 'default', transition: 'background 0.15s',
                            }}
                        >
                            <div style={{
                                width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0,
                            }} />
                            <span style={{ flex: 1, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                            {/* Percentage bar */}
                            <div style={{
                                flex: '0 0 60px', height: 5, background: 'var(--bg-tertiary)',
                                borderRadius: 3, overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${s.pct}%`, height: '100%', background: s.color,
                                    borderRadius: 3, transition: 'width 0.3s ease',
                                }} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', minWidth: 36, textAlign: 'right', fontSize: 11 }}>{s.pct.toFixed(1)}%</span>
                            <span style={{ fontWeight: 600, minWidth: 76, textAlign: 'right', fontSize: 11 }}>{formatPrice(s.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
