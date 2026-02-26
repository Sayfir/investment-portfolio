import { useRef, useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { formatPrice } from '../services/financeService';

const RANGES = [
    { label: '7D', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: 'All', days: Infinity },
];

export default function PerformanceChart({ history }) {
    const canvasRef = useRef(null);
    const [range, setRange] = useState('1M');

    if (!history || history.length < 2) return null;

    const rangeDays = RANGES.find(r => r.label === range)?.days ?? Infinity;
    const cutoff = rangeDays === Infinity ? 0 : Date.now() - rangeDays * 86400000;
    const data = history.filter(h => new Date(h.date).getTime() >= cutoff);

    if (data.length < 2) return null;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal || 1;
    const isPositive = values[values.length - 1] >= values[0];
    const change = values[values.length - 1] - values[0];
    const changePct = values[0] > 0 ? (change / values[0] * 100) : 0;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length < 2) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.parentElement.clientWidth;
        const h = 200;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#30363d';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            const y = 20 + (i / 4) * (h - 40);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Line
        const lineColor = isPositive ? '#39d353' : '#f85149';
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - 20 - ((d.value - minVal) / valRange) * (h - 40);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Gradient fill
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, isPositive ? 'rgba(57,211,83,0.15)' : 'rgba(248,81,73,0.15)');
        grad.addColorStop(1, 'transparent');
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
    });

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Activity size={16} style={{ color: 'var(--accent-blue)' }} />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Portfolio Performance</span>
                    <span style={{
                        fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: isPositive ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                        color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                        {isPositive ? '+' : ''}{changePct.toFixed(2)}%
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    {RANGES.map(r => (
                        <button
                            key={r.label}
                            onClick={() => setRange(r.label)}
                            style={{
                                padding: '4px 10px', fontSize: 11, fontWeight: 600,
                                borderRadius: 'var(--radius-sm)',
                                border: range === r.label ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                                background: range === r.label ? 'var(--accent-blue-dim)' : 'var(--bg-tertiary)',
                                color: range === r.label ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{formatPrice(values[values.length - 1])}</div>
                </div>
                <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Change</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {isPositive ? '+' : ''}{formatPrice(change)}
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ width: '100%' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                <span>{data[0]?.date}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
}
