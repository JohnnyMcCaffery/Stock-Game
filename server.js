import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const dataDir = path.resolve(__dirname, 'data');
const saveFilePath = path.join(dataDir, 'savegame.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Get saved game state from hard drive file
app.get('/api/state', (req, res) => {
  if (fs.existsSync(saveFilePath)) {
    try {
      const data = fs.readFileSync(saveFilePath, 'utf-8');
      return res.json(JSON.parse(data));
    } catch {
      return res.status(500).json({ error: 'Failed to read savegame file' });
    }
  }
  return res.json({ exists: false });
});

// Save game state to hard drive file
app.post('/api/state', (req, res) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(saveFilePath, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch {
    return res.status(500).json({ error: 'Failed to write savegame file to disk' });
  }
});

// Reset savegame file
app.delete('/api/state', (req, res) => {
  if (fs.existsSync(saveFilePath)) {
    fs.unlinkSync(saveFilePath);
  }
  return res.json({ success: true });
});

// Live Market Price Proxy Endpoint (/api/quote?symbol=...)
const quoteCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

app.get('/api/quote', async (req, res) => {
  try {
    const rawSymbol = (req.query.symbol || '').toString();
    if (!rawSymbol) {
      return res.status(400).json({ error: 'Missing symbol query parameter' });
    }

    const cleanUpper = rawSymbol.trim().toUpperCase();
    const symbolMap = {
      'INTEL': 'INTC',
      'S&P 500': 'SPY',
      'S&P': 'SPY',
      'SP500': 'SPY',
      'GSPC': 'SPY',
      'NASDAQ 100': 'QQQ',
      'NASDAQ': 'QQQ',
      'IXIC': 'QQQ',
      'DOW JONES': 'DIA',
      'DOW': 'DIA',
      'DJI': 'DIA',
      'GOLD': 'GLD',
      'GOLD SPOT': 'GLD',
      'XAU-USD': 'GLD',
      'SILVER': 'SLV',
      'SILVER SPOT': 'SLV',
      'XAG-USD': 'SLV',
      'CRUDE OIL': 'USO',
      'OIL': 'USO',
      'WTI': 'USO',
      'OIL-WTI': 'USO',
      'BRENT': 'BNO',
      'BRENT OIL': 'BNO',
      'NATURAL GAS': 'UNG',
      'NAT GAS': 'UNG',
      'NAT-GAS': 'UNG',
      'COPPER': 'CPER',
      'PLATINUM': 'PPLT',
    };

    const targetTicker = symbolMap[cleanUpper] || cleanUpper;

    // Check in-memory cache first to avoid rate limiting
    const now = Date.now();
    const cached = quoteCache.get(targetTicker);
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return res.json(cached.data);
    }

    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetTicker)}?interval=1d&range=1d`;

    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number') {
        const priceUSD = meta.regularMarketPrice;
        const prevCloseUSD = meta.chartPreviousClose || meta.previousClose || priceUSD;
        const change24h = prevCloseUSD > 0 ? parseFloat((((priceUSD - prevCloseUSD) / prevCloseUSD) * 100).toFixed(2)) : 0;
        const highUSD = meta.regularMarketDayHigh || Math.max(priceUSD, prevCloseUSD);
        const lowUSD = meta.regularMarketDayLow || Math.min(priceUSD, prevCloseUSD);

        const payload = {
          success: true,
          symbol: targetTicker,
          priceUSD,
          prevCloseUSD,
          highUSD,
          lowUSD,
          change24h,
          currency: meta.currency || 'USD'
        };

        quoteCache.set(targetTicker, { timestamp: now, data: payload });
        return res.json(payload);
      }
    }
    return res.status(404).json({ error: `No price quote found for ${rawSymbol}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch live market quote', details: err?.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Stock Game Server running on http://localhost:${PORT}`);
});
