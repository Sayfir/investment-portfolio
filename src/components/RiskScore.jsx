import { useRef, useEffect, useMemo } from 'react';
import { Shield } from 'lucide-react';

export default function RiskScore({ portfolio }) {
    const canvasRef = useRef(null);

    const { score, level, color, factors } = useMemo(() => {
        if (portfolio.length === 0) return { score: 0, level: 'N/A', color: 'var(--text-muted)', factors: [] };

        const facts = [];

        // 1. Volatility: average |dayChangePct|
        const changes = portfolio.filter(a => a.dayChangePct != null).map(a => Math.abs(a.dayChangePct));
        const avgVol = changes.length > 0 ? changes.reduce((s, v) => s + v, 0) / changes.length : 0;
        const volScore = Math.min(avgVol * 10, 40); // max 40 points
        facts.push({ label: 'Volatility', value: `${avgVol.toFixed(1)}% avg`, points: volScore });

        // 2. Concentration: top holding %
        const totalVal = portfolio.reduce((s, a) => s + (a.currentPrice ?? a.avgPrice) * a.quantity, 0);
        const topPct = totalVal > 0
            ? Math.max(...portfolio.map(a => ((a.currentPrice ?? a.avgPrice) * a.quantity / totalVal) * 100))
            : 0;
        const concScore = topPct > 50 ? 25 : topPct > 30 ? 15 : topPct > 20 ? 8 : 3;
        facts.push({ label: 'Concentration', value: `${topPct.toFixed(0)}% top`, points: concScore });

        // 3. Diversification: number of unique sectors
        const sectors = new Set(portfolio.map(a => a.sector || 'Unknown'));
        const divScore = sectors.size <= 1 ? 20 : sectors.size <= 2 ? 12 : sectors.size <= 3 ? 6 : 2;
        facts.push({ label: 'Sectors', value: `${sectors.size}`, points: divScore });

        // 4. Asset count
        const countScore = portfolio.length < 3 ? 15 : portfolio.length < 5 ? 8 : portfolio.length < 10 ? 4 : 1;
        facts.push({ label: 'Assets', value: `${portfolio.length}`, points: countScore });

        const total = Math.min(100, Math.round(volScore + concScore + divScore + countScore));
        const lvl = total >= 70 ? 'Very High' : total >= 45 ? 'High' : total >= 25 ? 'Medium' : 'Low';
        const clr = total >= 70 ? 'var(--accent-red)' : total >= 45 ? '#f0c040' : total >= 25 ? 'var(--accent-blue)' : 'var(--accent-green)';

        return { score: total, level: lvl, color: clr, factors: facts };
    }, [portfolio]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 180, h = 100;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2, cy = 90;
        const r = 75;
        const startAngle = Math.PI;
        const endAngle = 2 * Math.PI;

        // Background arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.strokeStyle = 'var(--bg-tertiary)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Colored segments
        const segments = [
            { end: 0.25, color: '#39d353' },
            { end: 0.45, color: '#58a6ff' },
            { end: 0.70, color: '#f0c040' },
            { end: 1.00, color: '#f85149' },
        ];
        let segStart = startAngle;
        for (const seg of segments) {
            const segEnd = startAngle + (endAngle - startAngle) * seg.end;
            ctx.beginPath();
            ctx.arc(cx, cy, r, segStart, segEnd);
            ctx.strokeStyle = seg.color;
            ctx.globalAlpha = 0.25;
            ctx.lineWidth = 12;
            ctx.lineCap = 'butt';
            ctx.stroke();
            ctx.globalAlpha = 1;
            segStart = segEnd;
        }

        // Needle
        const needleAngle = startAngle + (endAngle - startAngle) * (score / 100);
        const needleLen = r - 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }, [score, color]);

    if (portfolio.length === 0) return null;

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
        }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} style={{ color: 'var(--accent-blue)' }} />
                Portfolio Risk Score
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <canvas ref={canvasRef} />
                    <div style={{ marginTop: -16, fontSize: 28, fontWeight: 800, color }}>{score}</div>
                    <div style={{
                        fontSize: 12, fontWeight: 700, color, marginTop: 2,
                        padding: '2px 12px', borderRadius: 20,
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                        display: 'inline-block',
                    }}>{level} Risk</div>
                </div>

                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {factors.map(f => (
                        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                            <span style={{ flex: '0 0 100px', fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</span>
                            <div style={{
                                flex: 1, height: 5, background: 'var(--bg-tertiary)',
                                borderRadius: 3, overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${(f.points / 40) * 100}%`, height: '100%',
                                    background: f.points > 20 ? 'var(--accent-red)' : f.points > 10 ? 'var(--accent-gold)' : 'var(--accent-green)',
                                    borderRadius: 3, transition: 'width 0.5s',
                                }} />
                            </div>
                            <span style={{ minWidth: 60, textAlign: 'right', color: 'var(--text-muted)', fontSize: 11 }}>{f.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
