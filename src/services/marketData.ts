import type { Stock } from '../types/stock';

export const INITIAL_STOCKS: Stock[] = [
  {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Tech',
    price: 178.45,
    change24h: 1.25,
    previousClose: 176.25,
    dayHigh: 179.80,
    dayLow: 175.90,
    volume: '54.2M',
    sparkline: [172, 174, 173, 175, 176, 178.45],
    history: generateMockHistory(178.45)
  },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Tech',
    price: 104.80,
    change24h: 3.85,
    previousClose: 100.91,
    dayHigh: 106.20,
    dayLow: 101.10,
    volume: '78.9M',
    sparkline: [95, 98, 101, 99, 102, 104.80],
    history: generateMockHistory(104.80)
  },
  {
    id: 'TSLA',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'Tech',
    price: 168.30,
    change24h: -2.15,
    previousClose: 172.00,
    dayHigh: 173.50,
    dayLow: 166.80,
    volume: '62.1M',
    sparkline: [175, 173, 170, 172, 169, 168.30],
    history: generateMockHistory(168.30)
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'Tech',
    price: 342.10,
    change24h: 0.85,
    previousClose: 339.20,
    dayHigh: 344.00,
    dayLow: 338.50,
    volume: '22.4M',
    sparkline: [335, 337, 338, 340, 339, 342.10],
    history: generateMockHistory(342.10)
  },
  {
    id: 'SHEL.L',
    symbol: 'SHEL.L',
    name: 'Shell plc',
    category: 'UK FTSE 100',
    price: 27.85,
    change24h: 1.64,
    previousClose: 27.40,
    dayHigh: 28.10,
    dayLow: 27.30,
    volume: '14.8M',
    sparkline: [26.8, 27.1, 27.0, 27.5, 27.6, 27.85],
    history: generateMockHistory(27.85)
  },
  {
    id: 'HSBA.L',
    symbol: 'HSBA.L',
    name: 'HSBC Holdings plc',
    category: 'UK FTSE 100',
    price: 6.92,
    change24h: 0.73,
    previousClose: 6.87,
    dayHigh: 6.98,
    dayLow: 6.84,
    volume: '28.1M',
    sparkline: [6.75, 6.80, 6.82, 6.88, 6.87, 6.92],
    history: generateMockHistory(6.92)
  },
  {
    id: 'AZN.L',
    symbol: 'AZN.L',
    name: 'AstraZeneca PLC',
    category: 'Healthcare',
    price: 124.60,
    change24h: -0.48,
    previousClose: 125.20,
    dayHigh: 126.10,
    dayLow: 124.00,
    volume: '3.2M',
    sparkline: [126, 125.5, 127, 126.2, 125, 124.60],
    history: generateMockHistory(124.60)
  },
  {
    id: 'AMZN',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    category: 'Tech',
    price: 144.50,
    change24h: 2.10,
    previousClose: 141.52,
    dayHigh: 145.80,
    dayLow: 141.20,
    volume: '38.6M',
    sparkline: [139, 140, 142, 141, 143, 144.50],
    history: generateMockHistory(144.50)
  },
  {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc. (Google)',
    category: 'Tech',
    price: 139.20,
    change24h: 0.43,
    previousClose: 138.60,
    dayHigh: 140.50,
    dayLow: 138.10,
    volume: '24.1M',
    sparkline: [136, 137, 138, 137.5, 138.8, 139.20],
    history: generateMockHistory(139.20)
  },
  {
    id: 'META',
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    category: 'Tech',
    price: 384.70,
    change24h: 3.12,
    previousClose: 373.05,
    dayHigh: 388.00,
    dayLow: 374.50,
    volume: '18.9M',
    sparkline: [365, 370, 372, 376, 378, 384.70],
    history: generateMockHistory(384.70)
  },
  {
    id: 'BTC-USD',
    symbol: 'BTC',
    name: 'Bitcoin (Crypto)',
    category: 'Crypto',
    price: 49250.00,
    change24h: 4.85,
    previousClose: 46970.00,
    dayHigh: 50100.00,
    dayLow: 46800.00,
    volume: '£22.4B',
    sparkline: [46000, 46500, 47800, 47200, 48500, 49250],
    history: generateMockHistory(49250)
  }
];

function generateMockHistory(currentPrice: number) {
  const points = [];
  const times = ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:00'];
  let price = currentPrice * 0.96;
  
  for (let i = 0; i < times.length; i++) {
    const factor = 1 + (Math.random() * 0.03 - 0.014);
    price = i === times.length - 1 ? currentPrice : price * factor;
    points.push({
      time: times[i],
      price: parseFloat(price.toFixed(2))
    });
  }
  return points;
}

/**
 * Fetch live USD to GBP exchange rate from Open Exchange Rates / ER-API (CORS-enabled)
 */
export async function getLiveUsdToGbpRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates.GBP === 'number') {
        return data.rates.GBP;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live FX rate, using 0.78 fallback rate', err);
  }
  return 0.78;
}

/**
 * Fetch live Crypto prices from CoinGecko API (No API key needed)
 */
export async function fetchLiveCryptoPrices(): Promise<{ btcGbp: number; btcChange: number } | null> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp&include_24hr_change=true');
    if (res.ok) {
      const data = await res.json();
      if (data && data.bitcoin) {
        return {
          btcGbp: data.bitcoin.gbp,
          btcChange: parseFloat(data.bitcoin.gbp_24h_change?.toFixed(2) || '0'),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live CoinGecko crypto data', err);
  }
  return null;
}

/**
 * Fetch real live stock quotes from Finnhub API or free quote endpoint
 */
export async function fetchFinnhubQuote(symbol: string, apiKey: string): Promise<{ priceUSD: number; change24h: number; high: number; low: number; prevClose: number } | null> {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.c === 'number' && data.c > 0) {
        return {
          priceUSD: data.c,
          change24h: parseFloat(data.dp?.toFixed(2) || '0'),
          high: data.h || data.c,
          low: data.l || data.c,
          prevClose: data.pc || data.c,
        };
      }
    }
  } catch (err) {
    console.warn(`Finnhub quote fetch failed for ${symbol}`, err);
  }
  return null;
}

/**
 * Main Live Data Fetcher service updating stocks with real market data
 */
export async function fetchRealTimeMarketData(currentStocks: Stock[], finnhubApiKey?: string): Promise<{ stocks: Stock[]; updatedCount: number; fxRate: number }> {
  const usdToGbp = await getLiveUsdToGbpRate();
  const cryptoData = await fetchLiveCryptoPrices();
  let updatedCount = 0;

  const updatedStocks = await Promise.all(
    currentStocks.map(async (stock) => {
      // 1. Crypto updates via CoinGecko
      if (stock.id === 'BTC-USD' && cryptoData) {
        updatedCount++;
        const newPrice = cryptoData.btcGbp;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        return {
          ...stock,
          price: newPrice,
          change24h: cryptoData.btcChange,
          dayHigh: Math.max(stock.dayHigh, newPrice),
          dayLow: Math.min(stock.dayLow, newPrice),
          sparkline: [...stock.sparkline.slice(1), newPrice],
          history: [...stock.history.slice(1), { time: timeStr, price: newPrice }],
        };
      }

      // 2. Stock updates via Finnhub API if user provided an API key
      if (finnhubApiKey && !stock.id.includes('.L') && stock.id !== 'BTC-USD') {
        const quote = await fetchFinnhubQuote(stock.symbol, finnhubApiKey);
        if (quote) {
          updatedCount++;
          const priceGBP = parseFloat((quote.priceUSD * usdToGbp).toFixed(2));
          const highGBP = parseFloat((quote.high * usdToGbp).toFixed(2));
          const lowGBP = parseFloat((quote.low * usdToGbp).toFixed(2));
          const prevCloseGBP = parseFloat((quote.prevClose * usdToGbp).toFixed(2));

          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

          return {
            ...stock,
            price: priceGBP,
            change24h: quote.change24h,
            dayHigh: Math.max(stock.dayHigh, highGBP),
            dayLow: Math.min(stock.dayLow, lowGBP),
            previousClose: prevCloseGBP,
            sparkline: [...stock.sparkline.slice(1), priceGBP],
            history: [...stock.history.slice(1), { time: timeStr, price: priceGBP }],
          };
        }
      }

      return stock;
    })
  );

  return { stocks: updatedStocks, updatedCount, fxRate: usdToGbp };
}

/**
 * Simulates real-time live stock price fluctuations (Fallback when market closed or no API key)
 */
export function simulateMarketTick(stocks: Stock[]): Stock[] {
  return stocks.map((stock) => {
    const percentChange = (Math.random() * 0.0085) - 0.004;
    const priceDelta = stock.price * percentChange;
    const newPrice = Math.max(0.01, parseFloat((stock.price + priceDelta).toFixed(2)));
    
    const newDayHigh = Math.max(stock.dayHigh, newPrice);
    const newDayLow = Math.min(stock.dayLow, newPrice);
    const change24h = parseFloat((((newPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2));

    const updatedSparkline = [...stock.sparkline.slice(1), newPrice];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const updatedHistory = [...stock.history.slice(1), { time: timeStr, price: newPrice }];

    return {
      ...stock,
      price: newPrice,
      change24h,
      dayHigh: newDayHigh,
      dayLow: newDayLow,
      sparkline: updatedSparkline,
      history: updatedHistory
    };
  });
}
