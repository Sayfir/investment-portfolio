import { useState, useEffect } from 'react';

const THEME_KEY = 'investiq_theme';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch { }
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return { theme, toggleTheme };
}
