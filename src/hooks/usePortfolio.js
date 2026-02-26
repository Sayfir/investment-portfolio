import { useState, useEffect, useCallback } from 'react';
import { fetchQuote } from '../services/financeService';

const STORAGE_KEY = 'investiq_portfolio';
const GOAL_KEY = 'investiq_portfolio_goal';
const HISTORY_KEY = 'investiq_portfolio_history';

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveToStorage(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
}

function loadGoalFromStorage() {
    try {
        const raw = localStorage.getItem(GOAL_KEY);
        return raw != null ? parseFloat(raw) : null;
    } catch { return null; }
}

function saveGoalToStorage(value) {
    try {
        if (value != null) localStorage.setItem(GOAL_KEY, String(value));
        else localStorage.removeItem(GOAL_KEY);
    } catch { }
}

function loadHistoryFromStorage() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveHistoryToStorage(data) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(data)); } catch { }
}

const TICKER_SECTORS = {
    DFTX: 'Healthcare', BMRN: 'Healthcare', IMUX: 'Healthcare', IBRX: 'Healthcare',
    GOOG: 'Technology', NVDA: 'Technology', AMZN: 'Technology', NFLX: 'Technology',
    S: 'Technology', IONQ: 'Technology', SOUN: 'Technology', VERI: 'Technology',
    RELY: 'Technology', IREN: 'Technology',
    SMR: 'Energy',
    CRGO: 'Industrial',
};

function applySectors(portfolio) {
    let changed = false;
    const result = portfolio.map(a => {
        if (!a.sector && TICKER_SECTORS[a.ticker]) {
            changed = true;
            return { ...a, sector: TICKER_SECTORS[a.ticker] };
        }
        return a;
    });
    return changed ? result : portfolio;
}

export function usePortfolio() {
    const [portfolio, setPortfolio] = useState(() => applySectors(loadFromStorage()));
    const [loading, setLoading] = useState(false);
    const [portfolioGoal, setPortfolioGoalState] = useState(loadGoalFromStorage);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(0);
    const [history, setHistory] = useState(loadHistoryFromStorage);

    useEffect(() => {
        let isMounted = true;
        async function hydratePrices() {
            const current = loadFromStorage();
            if (current.length === 0) return;

            setPortfolio(prev => prev.map(a => ({ ...a, priceLoading: true })));

            const updates = await Promise.all(
                current.map(async (a) => {
                    const quote = await fetchQuote(a.ticker);
                    return { id: a.id, quote };
                })
            );

            if (!isMounted) return;

            setPortfolio(prev => prev.map(a => {
                const upd = updates.find(u => u.id === a.id);
                if (!upd?.quote) return { ...a, priceLoading: false };
                return {
                    ...a,
                    currentPrice: upd.quote.price ?? null,
                    dayChange: upd.quote.dayChange ?? null,
                    dayChangePct: upd.quote.dayChangePct ?? null,
                    preMarketPrice: upd.quote.preMarketPrice ?? null,
                    preMarketChange: upd.quote.preMarketChange ?? null,
                    preMarketChangePct: upd.quote.preMarketChangePct ?? null,
                    name: upd.quote.name || a.name || a.ticker,
                    currency: upd.quote.currency || a.currency || 'USD',
                    priceLoading: false,
                    lastUpdated: Date.now(),
                };
            }));
        }
        hydratePrices();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => saveToStorage(portfolio), [portfolio]);
    useEffect(() => saveHistoryToStorage(history), [history]);

    const setPortfolioGoal = useCallback((value) => {
        const parsed = value !== '' && value != null ? parseFloat(value) : null;
        setPortfolioGoalState(parsed);
        saveGoalToStorage(parsed);
    }, []);

    const refreshAsset = useCallback(async (id) => {
        setPortfolio(prev =>
            prev.map(a => a.id === id ? { ...a, priceLoading: true } : a)
        );
        const asset = loadFromStorage().find(a => a.id === id) || portfolio.find(a => a.id === id);
        if (!asset) return;
        const quote = await fetchQuote(asset.ticker);
        setPortfolio(prev =>
            prev.map(a =>
                a.id === id
                    ? {
                        ...a,
                        currentPrice: quote?.price ?? null,
                        dayChange: quote?.dayChange ?? null,
                        dayChangePct: quote?.dayChangePct ?? null,
                        preMarketPrice: quote?.preMarketPrice ?? null,
                        preMarketChange: quote?.preMarketChange ?? null,
                        preMarketChangePct: quote?.preMarketChangePct ?? null,
                        name: quote?.name || a.name || a.ticker,
                        currency: quote?.currency || a.currency || 'USD',
                        priceLoading: false,
                        lastUpdated: Date.now(),
                    }
                    : a
            )
        );
    }, [portfolio]);

    const addAsset = useCallback(async ({ ticker, type, quantity, avgPrice, goalPrice, dividend, sector }) => {
        const t = ticker.toUpperCase();
        const newQty = parseFloat(quantity);
        const newPrice = parseFloat(avgPrice);

        const existing = loadFromStorage().find(a => a.ticker === t) || portfolio.find(a => a.ticker === t);

        if (existing) {
            const totalQty = existing.quantity + newQty;
            const weightedAvg = (existing.quantity * existing.avgPrice + newQty * newPrice) / totalQty;

            setPortfolio(prev => prev.map(a =>
                a.ticker === t
                    ? {
                        ...a,
                        quantity: totalQty,
                        avgPrice: +weightedAvg.toFixed(6),
                        goalPrice: goalPrice != null ? parseFloat(goalPrice) : a.goalPrice,
                        dividend: dividend != null ? dividend : a.dividend,
                        sector: sector || a.sector,
                        priceLoading: true,
                    }
                    : a
            ));

            const quote = await fetchQuote(t);
            setPortfolio(prev => prev.map(a =>
                a.ticker === t
                    ? {
                        ...a,
                        currentPrice: quote?.price ?? null,
                        dayChange: quote?.dayChange ?? null,
                        dayChangePct: quote?.dayChangePct ?? null,
                        preMarketPrice: quote?.preMarketPrice ?? null,
                        preMarketChange: quote?.preMarketChange ?? null,
                        preMarketChangePct: quote?.preMarketChangePct ?? null,
                        name: quote?.name || a.name || t,
                        currency: quote?.currency || a.currency || 'USD',
                        priceLoading: false,
                        lastUpdated: Date.now(),
                    }
                    : a
            ));
            return;
        }

        const id = `${t}-${Date.now()}`;
        const newAsset = {
            id, ticker: t, type, quantity: newQty, avgPrice: newPrice,
            goalPrice: goalPrice != null ? parseFloat(goalPrice) : null,
            dividend: dividend || null, sector: sector || null,
            currentPrice: null, dayChange: null, dayChangePct: null,
            preMarketPrice: null, preMarketChange: null, preMarketChangePct: null,
            name: t, currency: 'USD', priceLoading: true, addedAt: Date.now(), lastUpdated: null,
        };
        setPortfolio(prev => [...prev, newAsset]);

        const quote = await fetchQuote(t);
        setPortfolio(prev =>
            prev.map(a =>
                a.id === id
                    ? {
                        ...a,
                        currentPrice: quote?.price ?? null,
                        dayChange: quote?.dayChange ?? null,
                        dayChangePct: quote?.dayChangePct ?? null,
                        preMarketPrice: quote?.preMarketPrice ?? null,
                        preMarketChange: quote?.preMarketChange ?? null,
                        preMarketChangePct: quote?.preMarketChangePct ?? null,
                        name: quote?.name || a.ticker,
                        currency: quote?.currency || 'USD',
                        priceLoading: false,
                        lastUpdated: Date.now(),
                    }
                    : a
            )
        );
    }, [portfolio]);

    const removeAsset = useCallback((id) => setPortfolio(prev => prev.filter(a => a.id !== id)), []);

    const updateGoal = useCallback((id, newGoal) => {
        setPortfolio(prev =>
            prev.map(a => a.id === id
                ? { ...a, goalPrice: newGoal !== '' && newGoal != null ? parseFloat(newGoal) : null }
                : a
            )
        );
    }, []);

    const refreshAll = useCallback(async () => {
        setLoading(true);
        const current = loadFromStorage();
        await Promise.all(current.map(a => refreshAsset(a.id)));
        setLoading(false);

        const updated = loadFromStorage();
        const totalVal = updated.reduce((s, a) => {
            const price = a.currentPrice ?? a.avgPrice;
            return s + price * a.quantity;
        }, 0);
        const today = new Date().toISOString().slice(0, 10);
        setHistory(prev => {
            const filtered = prev.filter(h => h.date !== today);
            return [...filtered, { date: today, value: totalVal }].sort((a, b) => a.date.localeCompare(b.date));
        });
    }, [refreshAsset]);

    useEffect(() => {
        if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
        const id = setInterval(() => refreshAll(), autoRefreshInterval);
        return () => clearInterval(id);
    }, [autoRefreshInterval, refreshAll]);

    const summary = (() => {
        let totalValue = 0, totalCost = 0, totalDayChange = 0;
        let preMarketValue = 0, preMarketChangeAbs = 0;
        let hasPreMarket = false;

        for (const a of portfolio) {
            const price = a.currentPrice ?? a.avgPrice;
            totalValue += price * a.quantity;
            totalCost += a.avgPrice * a.quantity;
            if (a.dayChange != null) totalDayChange += a.dayChange * a.quantity;

            const pmPrice = a.preMarketPrice ?? price;
            preMarketValue += pmPrice * a.quantity;
            if (a.preMarketPrice != null) {
                hasPreMarket = true;
                preMarketChangeAbs += (a.preMarketPrice - price) * a.quantity;
            }
        }

        const totalGain = totalValue - totalCost;
        const totalGainPct = totalCost ? (totalGain / totalCost) * 100 : 0;
        const dayChangePct = totalValue ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;
        const preMarketChangePct = totalValue ? (preMarketChangeAbs / totalValue) * 100 : 0;

        return {
            totalValue, totalCost, totalGain, totalGainPct,
            totalDayChange, dayChangePct,
            preMarketValue: hasPreMarket ? preMarketValue : null,
            preMarketChangeAbs: hasPreMarket ? preMarketChangeAbs : null,
            preMarketChangePct: hasPreMarket ? preMarketChangePct : null,
        };
    })();

    // Extra exported function to handle imports
    const replaceDataEntirely = useCallback((newPortfolio, newGoal, newHistory) => {
        if (newPortfolio) setPortfolio(applySectors(newPortfolio));
        if (newGoal !== undefined) setPortfolioGoal(newGoal);
        if (newHistory) setHistory(newHistory);
    }, [setPortfolioGoal]);

    return {
        portfolio, summary, loading, addAsset, removeAsset,
        refreshAll, refreshAsset, updateGoal, portfolioGoal,
        setPortfolioGoal, autoRefreshInterval, setAutoRefreshInterval,
        history, replaceDataEntirely
    };
}
