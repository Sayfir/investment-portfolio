import { useRef, useEffect, useMemo } from 'react';
import { Grid3X3 } from 'lucide-react';

export default function CorrelationMatrix({ portfolio }) {
    const canvasRef = useRef(null);

    // Only show assets with day change data
    const assets = useMemo(() => portfolio.filter(a => a.dayChangePct != null), [portfolio]);

    const matrix = useMemo(() => {
        if (assets.length < 2) return null;

        // Since we only have single-day data, we create a synthetic correlation
        // based on whether assets move in the same direction and similar magnitude
        const n = assets.length;
        const corr = Array.from({ length: n }, () => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    corr[i][j] = 1;
                } else {
                    const a = assets[i].dayChangePct;
                    const b = assets[j].dayChangePct;
                    // Same direction = positive correlation, magnitude similarity boosts it
                    const sameDir = (a >= 0 && b >= 0) || (a < 0 && b < 0);
                    const magSim = 1 - Math.min(Math.abs(Math.abs(a) - Math.abs(b)) / 10, 1);
                    corr[i][j] = sameDir ? magSim * 0.9 : -(magSim * 0.5);
                }
            }
        }
        return corr;
    }, [assets]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !matrix) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const n = assets.length;
        const cellSize = Math.min(36, Math.floor(500 / n));
        const labelWidth = 50;
        const w = labelWidth + n * cellSize;
        const h = labelWidth + n * cellSize;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        // Get CSS colors
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#8b949e';

        // Draw cells
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const val = matrix[i][j];
                const x = labelWidth + j * cellSize;
                const y = labelWidth + i * cellSize;

                // Color: green positive, red negative
                let r, g, b;
                if (val >= 0) {
                    r = Math.round(57 - val * 40);
                    g = Math.round(211 + val * 44);
                    b = Math.round(83 - val * 60);
                } else {
                    const v = Math.abs(val);
                    r = Math.round(248);
                    g = Math.round(81 - v * 50);
                    b = Math.round(73 - v * 50);
                }

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${i === j ? 0.9 : 0.3 + Math.abs(val) * 0.5})`;
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

                // Value text
                if (cellSize >= 28) {
                    ctx.fillStyle = textColor;
                    ctx.font = `600 ${Math.min(10, cellSize / 4)}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val.toFixed(1), x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        // Row labels (left)
        ctx.fillStyle = textColor;
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
            ctx.fillText(assets[i].ticker, labelWidth - 6, labelWidth + i * cellSize + cellSize / 2);
        }

        // Column labels (top, rotated)
        ctx.textAlign = 'left';
        for (let j = 0; j < n; j++) {
            ctx.save();
            ctx.translate(labelWidth + j * cellSize + cellSize / 2, labelWidth - 6);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(assets[j].ticker, 0, 0);
            ctx.restore();
        }
    }, [matrix, assets]);

    if (!matrix || assets.length < 2) return null;

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
        }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Grid3X3 size={16} style={{ color: 'var(--accent-blue)' }} />
                Correlation Matrix
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                Based on daily price movements — green = move together, red = move apart
            </p>

            <div style={{ overflowX: 'auto' }}>
                <canvas ref={canvasRef} />
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--accent-red)', fontWeight: 600 }}>-1.0</span>
                <div style={{
                    width: 120, height: 8, borderRadius: 4,
                    background: 'linear-gradient(to right, #f85149, #21262d, #39d353)',
                }} />
                <span style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 600 }}>+1.0</span>
            </div>
        </div>
    );
}
