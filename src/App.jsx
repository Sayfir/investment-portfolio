import { useState } from 'react';
import { Plus, FlaskConical, Settings, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, X } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import PortfolioTable from './components/PortfolioTable';
import AddAssetModal from './components/AddAssetModal';
import ImportExportData from './components/ImportExportData';
import PortfolioGoalCard from './components/PortfolioGoalCard';
import TopMovers from './components/TopMovers';
import DividendSummary from './components/DividendSummary';
import SectorChart from './components/SectorChart';
import PerformanceChart from './components/PerformanceChart';
import RiskScore from './components/RiskScore';
import Milestones from './components/Milestones';
import CorrelationMatrix from './components/CorrelationMatrix';
import WhatIfSimulator from './components/WhatIfSimulator';
import { usePortfolio } from './hooks/usePortfolio';
import { useAlerts } from './hooks/useAlerts';
import { useTheme } from './hooks/useTheme';
import { useWidgetLayout } from './hooks/useWidgetLayout';

const PAGE_TITLES = {
    dashboard: 'Dashboard',
    portfolio: 'Portfolio',
};

function WidgetManager({ widgets, onToggle, onMove, onReset, onClose }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ width: 400 }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Settings size={16} /> Customize Dashboard
                    </h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    Toggle widgets on/off and reorder them using the arrows.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {widgets.map((w, i) => (
                        <div key={w.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)', fontSize: 13,
                            opacity: w.visible ? 1 : 0.5,
                        }}>
                            <button
                                onClick={() => onToggle(w.id)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: w.visible ? 'var(--accent-green)' : 'var(--text-muted)',
                                    padding: 2,
                                }}
                            >
                                {w.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <span style={{ flex: 1, fontWeight: 600 }}>{w.label}</span>
                            <button
                                onClick={() => onMove(w.id, -1)}
                                disabled={i === 0}
                                style={{
                                    background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer',
                                    color: i === 0 ? 'var(--border)' : 'var(--text-secondary)', padding: 2,
                                }}
                            >
                                <ArrowUp size={13} />
                            </button>
                            <button
                                onClick={() => onMove(w.id, 1)}
                                disabled={i === widgets.length - 1}
                                style={{
                                    background: 'none', border: 'none',
                                    cursor: i === widgets.length - 1 ? 'default' : 'pointer',
                                    color: i === widgets.length - 1 ? 'var(--border)' : 'var(--text-secondary)', padding: 2,
                                }}
                            >
                                <ArrowDown size={13} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="modal-actions" style={{ marginTop: 14 }}>
                    <button className="btn btn-ghost" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <RotateCcw size={12} /> Reset
                    </button>
                    <button className="btn btn-primary" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [showModal, setShowModal] = useState(false);
    const [showWhatIf, setShowWhatIf] = useState(false);
    const [showWidgetManager, setShowWidgetManager] = useState(false);
    const {
        portfolio, summary, loading, addAsset, removeAsset, refreshAll,
        refreshAsset, updateGoal, portfolioGoal, setPortfolioGoal,
        autoRefreshInterval, setAutoRefreshInterval, history, replaceDataEntirely
    } = usePortfolio();
    const { theme, toggleTheme } = useTheme();
    const { alerts, addAlert, removeAlert } = useAlerts(portfolio);
    const { widgets, toggleWidget, moveWidget, resetLayout, isVisible } = useWidgetLayout();

    // Map widget IDs to their rendered components
    const widgetComponents = {
        summary: <SummaryCards key="summary" summary={summary} />,
        topMovers: <TopMovers key="topMovers" portfolio={portfolio} />,
        goal: <PortfolioGoalCard key="goal" totalValue={summary.totalValue} portfolioGoal={portfolioGoal} onSetGoal={setPortfolioGoal} />,
        performance: <PerformanceChart key="performance" history={history} />,
        riskScore: <RiskScore key="riskScore" portfolio={portfolio} />,
        sector: <SectorChart key="sector" portfolio={portfolio} />,
        dividend: <DividendSummary key="dividend" portfolio={portfolio} />,
        milestones: <Milestones key="milestones" portfolio={portfolio} totalValue={summary.totalValue} />,
        correlation: <CorrelationMatrix key="correlation" portfolio={portfolio} />,
        holdings: (
            <PortfolioTable
                key="holdings"
                portfolio={portfolio}
                onRemove={removeAsset}
                onRefreshAsset={refreshAsset}
                onUpdateGoal={updateGoal}
                alerts={alerts}
                onAddAlert={addAlert}
                onRemoveAlert={removeAlert}
            />
        ),
    };

    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} onNavigate={setActivePage} theme={theme} onToggleTheme={toggleTheme} />

            <div className="main-area">
                <Header
                    title={PAGE_TITLES[activePage]}
                    onRefresh={refreshAll}
                    isRefreshing={loading}
                    autoRefreshInterval={autoRefreshInterval}
                    onSetAutoRefresh={setAutoRefreshInterval}
                />

                <main className="main-content">
                    {/* Page Top Row */}
                    <div className="page-top">
                        <div className="page-top-left">
                            <h1>
                                {activePage === 'dashboard' ? 'Overview' : 'My Portfolio'}
                            </h1>
                            <p>
                                {activePage === 'dashboard'
                                    ? 'Track the performance of your investment portfolio'
                                    : 'Add, manage and monitor all your assets'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {activePage === 'dashboard' && (
                                <>
                                    <ImportExportData onImport={replaceDataEntirely} />
                                    <div style={{ width: 1, background: 'var(--border)', margin: '4px 4px' }} />
                                    <button className="btn btn-ghost" onClick={() => setShowWhatIf(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FlaskConical size={14} /> What If
                                    </button>
                                    <button className="btn btn-ghost" onClick={() => setShowWidgetManager(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Settings size={14} /> Customize
                                    </button>
                                </>
                            )}
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={15} />
                                Add Asset
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Page — widgets rendered in user-defined order */}
                    {activePage === 'dashboard' && (
                        <>
                            {widgets.filter(w => w.visible).map(w => widgetComponents[w.id] || null)}
                        </>
                    )}

                    {/* Portfolio Page */}
                    {activePage === 'portfolio' && (
                        <>
                            <SummaryCards summary={summary} />
                            <PortfolioGoalCard
                                totalValue={summary.totalValue}
                                portfolioGoal={portfolioGoal}
                                onSetGoal={setPortfolioGoal}
                            />
                            <PortfolioTable
                                portfolio={portfolio}
                                onRemove={removeAsset}
                                onRefreshAsset={refreshAsset}
                                onUpdateGoal={updateGoal}
                                alerts={alerts}
                                onAddAlert={addAlert}
                                onRemoveAlert={removeAlert}
                            />
                        </>
                    )}
                </main>
            </div>

            {showModal && (
                <AddAssetModal
                    onClose={() => setShowModal(false)}
                    onAdd={addAsset}
                    portfolio={portfolio}
                />
            )}
            {showWhatIf && (
                <WhatIfSimulator
                    portfolio={portfolio}
                    onClose={() => setShowWhatIf(false)}
                />
            )}
            {showWidgetManager && (
                <WidgetManager
                    widgets={widgets}
                    onToggle={toggleWidget}
                    onMove={moveWidget}
                    onReset={resetLayout}
                    onClose={() => setShowWidgetManager(false)}
                />
            )}
        </div>
    );
}
