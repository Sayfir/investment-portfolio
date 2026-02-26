import { useState } from 'react';

const DEFAULT_WIDGETS = [
    { id: 'summary', label: 'Summary Cards', visible: true },
    { id: 'topMovers', label: 'Top Movers', visible: true },
    { id: 'goal', label: 'Portfolio Goal', visible: true },
    { id: 'performance', label: 'Performance Chart', visible: true },
    { id: 'riskScore', label: 'Risk Score', visible: true },
    { id: 'sector', label: 'Portfolio Allocation', visible: true },
    { id: 'dividend', label: 'Dividend Summary', visible: true },
    { id: 'milestones', label: 'Achievements', visible: true },
    { id: 'correlation', label: 'Correlation Matrix', visible: true },
    { id: 'holdings', label: 'Holdings Table', visible: true },
];

const STORAGE_KEY = 'investiq_widget_layout';

function loadLayout() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_WIDGETS;
        const saved = JSON.parse(raw);
        // Merge with defaults (add any new widgets not in saved)
        const savedIds = new Set(saved.map(w => w.id));
        const merged = [
            ...saved,
            ...DEFAULT_WIDGETS.filter(w => !savedIds.has(w.id)),
        ];
        return merged;
    } catch {
        return DEFAULT_WIDGETS;
    }
}

export function useWidgetLayout() {
    const [widgets, setWidgets] = useState(loadLayout);

    function saveWidgets(next) {
        setWidgets(next);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { }
    }

    function toggleWidget(id) {
        saveWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
    }

    function moveWidget(id, dir) {
        const idx = widgets.findIndex(w => w.id === id);
        if (idx < 0) return;
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= widgets.length) return;
        const next = [...widgets];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        saveWidgets(next);
    }

    function resetLayout() {
        saveWidgets(DEFAULT_WIDGETS);
    }

    function isVisible(id) {
        return widgets.find(w => w.id === id)?.visible ?? true;
    }

    return { widgets, toggleWidget, moveWidget, resetLayout, isVisible };
}
