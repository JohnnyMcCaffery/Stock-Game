import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localDatabasePlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const saveFilePath = path.join(dataDir, 'savegame.json');

  return {
    name: 'local-database-plugin',
    configureServer(server) {
      server.middlewares.use('/api/state', (req, res, next) => {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(saveFilePath)) {
            const data = fs.readFileSync(saveFilePath, 'utf-8');
            res.end(data);
          } else {
            res.end(JSON.stringify({ exists: false }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              fs.writeFileSync(saveFilePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write savegame file to disk' }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          if (fs.existsSync(saveFilePath)) {
            fs.unlinkSync(saveFilePath);
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });

      // Live Market Price Proxy Endpoint (/api/quote?symbol=...)
      const quoteCache = new Map<string, { timestamp: number; data: any }>();
      const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

      server.middlewares.use('/api/quote', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const rawSymbol = urlObj.searchParams.get('symbol') || '';
          if (!rawSymbol) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing symbol query parameter' }));
            return;
          }

          const cleanUpper = rawSymbol.trim().toUpperCase();
          const symbolMap: Record<string, string> = {
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
            res.end(JSON.stringify(cached.data));
            return;
          }

          const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetTicker)}?interval=1d&range=1d`;

          const response = await fetch(yahooUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          if (response.ok) {
            const data: any = await response.json();
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
              res.end(JSON.stringify(payload));
              return;
            }
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: `No price quote found for ${rawSymbol}` }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to fetch live market quote', details: err?.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localDatabasePlugin()],
});
