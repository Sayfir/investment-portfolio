const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DIST_DIR = path.join(__dirname, 'dist');
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

app.use(express.json({ limit: '10mb', strict: false }));

// Yahoo Finance Proxy
app.use('/api/yahoo', createProxyMiddleware({
    target: 'https://query1.finance.yahoo.com',
    changeOrigin: true,
    pathRewrite: { '^/api/yahoo': '' },
    secure: false,
}));

// Allow requests from Vite dev server or other origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ── Finnhub API Proxy ─────────────────────────────────────────────────────
app.get('/api/finnhub/quote/:symbol', async (req, res) => {
    if (!FINNHUB_API_KEY) return res.json({ error: 'No Finnhub API key configured' });
    try {
        const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
            params: { symbol: req.params.symbol, token: FINNHUB_API_KEY },
            timeout: 5000,
        });
        res.json(data);
    } catch (e) {
        res.status(502).json({ error: e.message });
    }
});

app.get('/api/finnhub/market-status', async (req, res) => {
    if (!FINNHUB_API_KEY) return res.json({ error: 'No Finnhub API key configured' });
    try {
        const { data } = await axios.get('https://finnhub.io/api/v1/stock/market-status', {
            params: { exchange: 'US', token: FINNHUB_API_KEY },
            timeout: 5000,
        });
        res.json(data);
    } catch (e) {
        res.status(502).json({ error: e.message });
    }
});

// ── Serve React Frontend ──────────────────────────────────────────────────
app.use(express.static(DIST_DIR));

// SPA Fallback
app.get('/*splat', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n💾 InvestIQ data server started on port ${PORT}`);
    console.log(`   Files stored in: ${DATA_DIR}`);
    if (FINNHUB_API_KEY) {
        console.log(`   ✅ Finnhub API key loaded`);
    } else {
        console.log(`   ⚠️  No FINNHUB_API_KEY set — pre-market data from Finnhub will be unavailable`);
        console.log(`      Set it: $env:FINNHUB_API_KEY="your_key"; npm run dev`);
    }
    console.log('');
});
