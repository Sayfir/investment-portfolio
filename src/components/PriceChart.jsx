import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';
import { formatLargeNumber } from '../services/financeService';

const COLORS = [
    '#58a6ff', '#39d353', '#bc8cff', '#f0c040', '#f85149',
    '#79c0ff', '#56d364', '#d2a8ff', '#ffa657', '#ff7b72',
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value, payload: item } = payload[0];
        return (
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
            }}>
                <p style={{ fontWeight: 700, marginBottom: 2 }}>{name}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{formatLargeNumber(value)}</p>
                <p style={{ color: 'var(--accent-green)' }}>{item.pct?.toFixed(2)}%</p>
            </div>
        );
    }
    return null;
};

export default function PriceChart({ portfolio }) {
    if (!portfolio.length) return null;

    const data = portfolio
        .map(a => {
            const price = a.currentPrice ?? a.avgPrice;
            const value = price * a.quantity;
            return { name: a.ticker, value, pct: 0 };
        })
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);

    const total = data.reduce((s, d) => s + d.value, 0);
    data.forEach(d => { d.pct = total ? (d.value / total) * 100 : 0; });

    if (!data.length) return null;

    return (
        <div className="chart-section">
            <p className="chart-title">Portfolio Allocation</p>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => (
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
