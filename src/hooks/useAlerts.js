import { useState, useEffect, useCallback } from 'react';

const ALERTS_KEY = 'investiq_alerts';

function loadAlerts() {
    try {
        const raw = localStorage.getItem(ALERTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveAlerts(alerts) {
    try { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts)); } catch { }
}

export function useAlerts(portfolio) {
    const [alerts, setAlerts] = useState(loadAlerts);

    // Save on change
    useEffect(() => {
        saveAlerts(alerts);
    }, [alerts]);

    // Check alerts against current prices
    useEffect(() => {
        if (!portfolio || portfolio.length === 0) return;

        const triggered = [];
        const updated = alerts.map(alert => {
            if (!alert.active) return alert;
            const asset = portfolio.find(a => a.ticker === alert.ticker);
            if (!asset || asset.currentPrice == null) return alert;

            const hit = alert.direction === 'above'
                ? asset.currentPrice >= alert.targetPrice
                : asset.currentPrice <= alert.targetPrice;

            if (hit) {
                triggered.push({ ...alert, currentPrice: asset.currentPrice });
                return { ...alert, active: false, triggeredAt: Date.now() };
            }
            return alert;
        });

        if (triggered.length > 0) {
            setAlerts(updated);
            // Browser notifications
            for (const t of triggered) {
                const dir = t.direction === 'above' ? '↑ above' : '↓ below';
                const msg = `${t.ticker} is now $${t.currentPrice.toFixed(2)} — ${dir} $${t.targetPrice.toFixed(2)}`;
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('InvestIQ Price Alert', { body: msg, icon: '📈' });
                }
            }
        }
    }, [portfolio]); // eslint-disable-line react-hooks/exhaustive-deps

    const addAlert = useCallback((ticker, targetPrice, direction = 'above') => {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        const newAlert = {
            id: `${ticker}-${Date.now()}`,
            ticker: ticker.toUpperCase(),
            targetPrice: parseFloat(targetPrice),
            direction,
            active: true,
            createdAt: Date.now(),
        };
        setAlerts(prev => [...prev, newAlert]);
    }, []);

    const removeAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const getAlertsForTicker = useCallback((ticker) => {
        return alerts.filter(a => a.ticker === ticker.toUpperCase());
    }, [alerts]);

    return { alerts, addAlert, removeAlert, getAlertsForTicker };
}
