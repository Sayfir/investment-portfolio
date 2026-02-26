import axios from 'axios';

const CORS_PROXY = 'https://corsproxy.io/?';

// ── Cache market status to avoid excessive API calls ──────────────────────
let _marketStatusCache = { data: null, ts: 0 };
const MARKET_STATUS_TTL = 60_000; // 1 minute

async function getMarketStatus() {
    if (Date.now() - _marketStatusCache.ts < MARKET_STATUS_TTL && _marketStatusCache.data) {
        return _marketStatusCache.data;
    }
    try {
        const { data } = await axios.get('/api/finnhub/market-status', { timeout: 5000 });
        if (data && !data.error) {
            _marketStatusCache = { data, ts: Date.now() };
            return data;
        }
    } catch { /* silent */ }
    return null;
}

// ── Yahoo Finance v8 Quote endpoint (has pre-market fields) ───────────────
async function fetchYahooQuote(ticker) {
    if (typeof window === 'undefined') return null;
    try {
        const url = `/api/yahoo/v8/finance/quote?symbols=${encodeURIComponent(ticker)}`;
        const { data } = await axios.get(url, { timeout: 8000 });
        const q = data?.quoteResponse?.result?.[0];
        if (!q) return null;
        return {
            price: +(q.regularMarketPrice || 0).toFixed(6),
            dayChange: +(q.regularMarketChange || 0).toFixed(2),
            dayChangePct: +(q.regularMarketChangePercent || 0).toFixed(2),
            name: q.shortName || q.longName || ticker,
            currency: q.currency || 'USD',
            preMarketPrice: q.preMarketPrice ?? null,
            preMarketChange: q.preMarketChange ?? null,
            preMarketChangePct: q.preMarketChangePercent ?? null,
        };
    } catch {
        return null;
    }
}

// ── Yahoo Finance v8 Chart endpoint (fallback, no pre-market fields) ──────
async function fetchYahooChart(ticker) {
    if (typeof window === 'undefined') return null;
    try {
        const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
        const { data } = await axios.get(url, { timeout: 8000 });
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        const dayChange = prevClose ? +(price - prevClose).toFixed(2) : 0;
        const dayChangePct = prevClose ? +((dayChange / prevClose) * 100).toFixed(2) : 0;
        return {
            price: +price.toFixed(6),
            dayChange,
            dayChangePct,
            name: meta.shortName || meta.symbol || ticker,
            currency: meta.currency || 'USD',
            preMarketPrice: meta.preMarketPrice ?? null,
            preMarketChange: meta.preMarketChange ?? null,
            preMarketChangePct: meta.preMarketChangePercent ?? null,
        };
    } catch {
        return null;
    }
}

// ── Yahoo Finance via public CORS proxy (fallback) ────────────────────────
async function fetchViaPublicProxy(ticker) {
    try {
        const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
        const url = `${CORS_PROXY}${encodeURIComponent(target)}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        const dayChange = prevClose ? +(price - prevClose).toFixed(2) : 0;
        const dayChangePct = prevClose ? +((dayChange / prevClose) * 100).toFixed(2) : 0;
        return {
            price: +price.toFixed(6),
            dayChange,
            dayChangePct,
            name: meta.shortName || meta.symbol || ticker,
            currency: meta.currency || 'USD',
            preMarketPrice: meta.preMarketPrice ?? null,
            preMarketChange: meta.preMarketChange ?? null,
            preMarketChangePct: meta.preMarketChangePercent ?? null,
        };
    } catch {
        return null;
    }
}

// ── Finnhub pre-market data via backend proxy ─────────────────────────────
async function fetchFinnhubPremarket(ticker, basePrice) {
    try {
        const status = await getMarketStatus();
        // Only fetch Finnhub pre-market data when outside regular hours
        // session can be: "pre-market", "regular", "post-market", or null (closed)
        const session = status?.session;
        const isExtendedHours = session === 'pre-market' || session === 'post-market';

        if (!isExtendedHours && session === 'regular') {
            // During regular hours, no pre-market data to show
            return null;
        }

        const { data } = await axios.get(`/api/finnhub/quote/${encodeURIComponent(ticker)}`, {
            timeout: 5000,
        });

        if (!data || data.error || data.c === 0) return null;

        // During extended hours, Finnhub's 'c' (current price) reflects the extended-hours price
        // 'pc' is previous close
        const currentPrice = data.c;
        const prevClose = data.pc;

        if (!currentPrice || !prevClose) return null;

        // If the Finnhub current price differs from the regular market price we already have,
        // that means there's extended-hours activity
        const refPrice = basePrice || prevClose;
        const priceChange = +(currentPrice - refPrice).toFixed(4);
        const changePct = +((priceChange / refPrice) * 100).toFixed(2);

        // Only return if there's meaningful difference (i.e., extended-hours trading is happening)
        if (Math.abs(currentPrice - refPrice) < 0.001) return null;

        return {
            preMarketPrice: +currentPrice.toFixed(6),
            preMarketChange: priceChange,
            preMarketChangePct: changePct,
            session: session || 'unknown',
        };
    } catch {
        return null;
    }
}

export async function fetchQuote(ticker) {
    const t = ticker.trim().toUpperCase();

    // Strategy 1: Try Yahoo Quote endpoint first (has native pre-market fields)
    let result = await fetchYahooQuote(t);

    // Strategy 2: Fall back to Yahoo Chart endpoint
    if (!result) {
        result = await fetchYahooChart(t);
    }

    // Strategy 3: Fall back to CORS proxy
    if (!result) {
        result = await fetchViaPublicProxy(t);
    }

    if (!result) return null;

    // If Yahoo didn't provide pre-market data, try Finnhub
    if (result.preMarketPrice == null) {
        const finnhub = await fetchFinnhubPremarket(t, result.price);
        if (finnhub) {
            result.preMarketPrice = finnhub.preMarketPrice;
            result.preMarketChange = finnhub.preMarketChange;
            result.preMarketChangePct = finnhub.preMarketChangePct;
        }
    }

    return result;
}

export function formatPrice(price, currency = 'USD') {
    if (price == null) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

export function formatLargeNumber(num, currency = 'USD') {
    if (num == null) return '—';
    const abs = Math.abs(num);
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    if (abs >= 1e9) return formatter.format(num / 1e9).replace(/\.?\d+$/, '') + 'B';
    if (abs >= 1e6) return formatter.format(num / 1e6).replace(/\.?\d+$/, '') + 'M';
    if (abs >= 1e3) return formatter.format(num / 1e3).replace(/\.?\d+$/, '') + 'K';
    return formatter.format(num);
}
