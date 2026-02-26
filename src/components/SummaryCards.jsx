import { DollarSign, TrendingUp, TrendingDown, BarChart2, Sunrise } from 'lucide-react';
import { formatPrice } from '../services/financeService';

function StatCard({ label, value, sub, colorClass, icon: Icon, accentVar }) {
    return (
        <div className="card" style={{ '--card-accent': `var(${accentVar})` }}>
            <div className="card-icon">
                <Icon size={48} />
            </div>
            <div className="card-label">
                <span
                    className="info-dot"
                    style={{ background: `var(${accentVar})` }}
                />
                {label}
            </div>
            <div className={`card-value ${colorClass}`}>{value}</div>
            {sub && <div className="card-sub">{sub}</div>}
        </div>
    );
}

export default function SummaryCards({ summary }) {
    const {
        totalValue,
        totalGain,
        totalGainPct,
        totalDayChange,
        dayChangePct,
        preMarketValue,
        preMarketChangeAbs,
        preMarketChangePct,
    } = summary;

    const gainPositive = totalGain >= 0;
    const dayPositive = totalDayChange >= 0;
    const pmPositive = (preMarketChangeAbs ?? 0) >= 0;

    return (
        <div className="summary-cards">
            <StatCard
                label="Total Portfolio Value"
                value={formatPrice(totalValue)}
                sub="All assets combined"
                colorClass=""
                icon={DollarSign}
                accentVar="--accent-blue"
            />
            <StatCard
                label="Day Gain / Loss"
                value={`${dayPositive ? '+' : ''}${formatPrice(totalDayChange)}`}
                sub={`${dayPositive ? '+' : ''}${dayChangePct.toFixed(2)}% today`}
                colorClass={dayPositive ? 'positive' : 'negative'}
                icon={dayPositive ? TrendingUp : TrendingDown}
                accentVar={dayPositive ? '--accent-green' : '--accent-red'}
            />
            {preMarketValue != null ? (
                <StatCard
                    label="Pre-Market Value"
                    value={formatPrice(preMarketValue)}
                    sub={`${pmPositive ? '+' : ''}${formatPrice(preMarketChangeAbs)} (${pmPositive ? '+' : ''}${preMarketChangePct.toFixed(2)}%)`}
                    colorClass={pmPositive ? 'positive' : 'negative'}
                    icon={Sunrise}
                    accentVar={pmPositive ? '--accent-green' : '--accent-red'}
                />
            ) : (
                <StatCard
                    label="Total Gain / Loss"
                    value={`${gainPositive ? '+' : ''}${formatPrice(totalGain)}`}
                    sub={`${gainPositive ? '+' : ''}${totalGainPct.toFixed(2)}% all time`}
                    colorClass={gainPositive ? 'positive' : 'negative'}
                    icon={BarChart2}
                    accentVar={gainPositive ? '--accent-green' : '--accent-red'}
                />
            )}
            {preMarketValue != null && (
                <StatCard
                    label="Total Gain / Loss"
                    value={`${gainPositive ? '+' : ''}${formatPrice(totalGain)}`}
                    sub={`${gainPositive ? '+' : ''}${totalGainPct.toFixed(2)}% all time`}
                    colorClass={gainPositive ? 'positive' : 'negative'}
                    icon={BarChart2}
                    accentVar={gainPositive ? '--accent-green' : '--accent-red'}
                />
            )}
        </div>
    );
}
