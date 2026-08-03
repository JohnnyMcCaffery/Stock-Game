import type { Stock, StockCategory } from '../types/stock';

export function generateMockHistory(currentPrice: number) {
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
export async function fetchLiveCryptoPrices(): Promise<Record<string, { priceGbp: number; change24h: number }> | null> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano&vs_currencies=gbp&include_24hr_change=true');
    if (res.ok) {
      const data = await res.json();
      const result: Record<string, { priceGbp: number; change24h: number }> = {};
      if (data.bitcoin) result['BTC-USD'] = { priceGbp: data.bitcoin.gbp, change24h: parseFloat(data.bitcoin.gbp_24h_change?.toFixed(2) || '0') };
      if (data.ethereum) result['ETH-USD'] = { priceGbp: data.ethereum.gbp, change24h: parseFloat(data.ethereum.gbp_24h_change?.toFixed(2) || '0') };
      if (data.solana) result['SOL-USD'] = { priceGbp: data.solana.gbp, change24h: parseFloat(data.solana.gbp_24h_change?.toFixed(2) || '0') };
      return result;
    }
  } catch (err) {
    console.warn('Failed to fetch live CoinGecko crypto data', err);
  }
  return null;
}

/**
 * Fetch real live stock quote from Finnhub API
 */
export async function fetchFinnhubQuote(symbol: string, apiKey: string): Promise<{ priceUSD: number; change24h: number; high: number; low: number; prevClose: number; name?: string } | null> {
  try {
    const cleanSym = symbol.replace('^', '');
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(cleanSym)}&token=${encodeURIComponent(apiKey)}`;
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

export const INITIAL_STOCKS: Stock[] = [
  // Tech & Global Equities
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
    id: 'AMD',
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    category: 'Tech',
    price: 112.40,
    change24h: 1.95,
    previousClose: 110.25,
    dayHigh: 113.80,
    dayLow: 109.90,
    volume: '45.1M',
    sparkline: [108, 109.5, 111, 110.8, 111.5, 112.40],
    history: generateMockHistory(112.40)
  },
  {
    id: 'INTC',
    symbol: 'INTC',
    name: 'Intel Corporation',
    category: 'Tech',
    price: 20.15,
    change24h: 1.45,
    previousClose: 19.86,
    dayHigh: 20.40,
    dayLow: 19.75,
    volume: '52.3M',
    sparkline: [19.2, 19.5, 19.7, 19.6, 19.9, 20.15],
    history: generateMockHistory(20.15)
  },

  // UK FTSE 100
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
    id: 'BP.L',
    symbol: 'BP.L',
    name: 'BP plc',
    category: 'UK FTSE 100',
    price: 4.82,
    change24h: 1.15,
    previousClose: 4.76,
    dayHigh: 4.88,
    dayLow: 4.75,
    volume: '32.4M',
    sparkline: [4.70, 4.72, 4.75, 4.78, 4.80, 4.82],
    history: generateMockHistory(4.82)
  },

  // Stock Market Indices & ETFs
  {
    id: 'GSPC',
    symbol: 'S&P 500',
    name: 'S&P 500 Index (SPY)',
    category: 'Indices',
    price: 412.50,
    change24h: 0.65,
    previousClose: 409.80,
    dayHigh: 414.20,
    dayLow: 409.10,
    volume: '82.5M',
    sparkline: [405, 407, 408, 410, 411, 412.50],
    history: generateMockHistory(412.50)
  },
  {
    id: 'IXIC',
    symbol: 'NASDAQ 100',
    name: 'Nasdaq 100 Index (QQQ)',
    category: 'Indices',
    price: 368.20,
    change24h: 1.12,
    previousClose: 364.12,
    dayHigh: 370.00,
    dayLow: 363.80,
    volume: '48.9M',
    sparkline: [360, 362, 365, 364, 366, 368.20],
    history: generateMockHistory(368.20)
  },
  {
    id: 'DJI',
    symbol: 'DOW JONES',
    name: 'Dow Jones Industrial Average (DIA)',
    category: 'Indices',
    price: 385.20,
    change24h: 0.38,
    previousClose: 383.74,
    dayHigh: 386.50,
    dayLow: 383.10,
    volume: '24.1M',
    sparkline: [380, 381, 383, 382, 384, 385.20],
    history: generateMockHistory(385.20)
  },
  {
    id: 'FTSE100',
    symbol: 'FTSE 100',
    name: 'FTSE 100 Index (UK)',
    category: 'Indices',
    price: 8240.50,
    change24h: 0.42,
    previousClose: 8206.00,
    dayHigh: 8265.00,
    dayLow: 8200.00,
    volume: '1.2B',
    sparkline: [8180, 8200, 8210, 8225, 8230, 8240.50],
    history: generateMockHistory(8240.50)
  },

  // Commodities & Precious Metals
  {
    id: 'XAU-USD',
    symbol: 'GOLD',
    name: 'Gold Spot (£ / oz)',
    category: 'Commodities',
    price: 1895.40,
    change24h: 0.95,
    previousClose: 1877.50,
    dayHigh: 1905.00,
    dayLow: 1872.00,
    volume: '12.4K',
    sparkline: [1860, 1870, 1880, 1875, 1890, 1895.40],
    history: generateMockHistory(1895.40)
  },
  {
    id: 'XAG-USD',
    symbol: 'SILVER',
    name: 'Silver Spot (£ / oz)',
    category: 'Commodities',
    price: 22.85,
    change24h: 1.42,
    previousClose: 22.53,
    dayHigh: 23.10,
    dayLow: 22.40,
    volume: '45.8K',
    sparkline: [22.1, 22.3, 22.4, 22.6, 22.7, 22.85],
    history: generateMockHistory(22.85)
  },
  {
    id: 'OIL-WTI',
    symbol: 'CRUDE OIL',
    name: 'WTI Crude Oil (£ / bbl)',
    category: 'Commodities',
    price: 61.20,
    change24h: -1.25,
    previousClose: 61.97,
    dayHigh: 62.40,
    dayLow: 60.80,
    volume: '310K',
    sparkline: [63.0, 62.5, 62.1, 61.8, 61.5, 61.20],
    history: generateMockHistory(61.20)
  },
  {
    id: 'OIL-BRENT',
    symbol: 'BRENT OIL',
    name: 'Brent Crude Oil (£ / bbl)',
    category: 'Commodities',
    price: 65.40,
    change24h: -0.85,
    previousClose: 65.96,
    dayHigh: 66.20,
    dayLow: 64.90,
    volume: '280K',
    sparkline: [67.0, 66.5, 66.1, 65.8, 65.5, 65.40],
    history: generateMockHistory(65.40)
  },
  {
    id: 'NAT-GAS',
    symbol: 'NAT GAS',
    name: 'Natural Gas Spot (£ / MMBtu)',
    category: 'Commodities',
    price: 2.45,
    change24h: 2.15,
    previousClose: 2.40,
    dayHigh: 2.49,
    dayLow: 2.38,
    volume: '190K',
    sparkline: [2.35, 2.38, 2.40, 2.42, 2.44, 2.45],
    history: generateMockHistory(2.45)
  },
  {
    id: 'COPPER',
    symbol: 'COPPER',
    name: 'High Grade Copper (£ / lb)',
    category: 'Commodities',
    price: 3.85,
    change24h: 0.92,
    previousClose: 3.81,
    dayHigh: 3.89,
    dayLow: 3.79,
    volume: '95K',
    sparkline: [3.75, 3.78, 3.80, 3.82, 3.84, 3.85],
    history: generateMockHistory(3.85)
  },
];

/**
 * Global Financial Name-to-Ticker Resolver Dictionary
 */
interface FinancialAssetMeta {
  symbol: string;
  id?: string;
  finnhubTicker?: string;
  name: string;
  category: StockCategory;
  defaultPriceGBP: number;
}

const FINANCIAL_LOOKUP_MAP: Record<string, FinancialAssetMeta> = {
  // Equities (Company Name & Ticker mappings)
  'INTEL': { symbol: 'INTC', id: 'INTC', finnhubTicker: 'INTC', name: 'Intel Corporation', category: 'Tech', defaultPriceGBP: 20.15 },
  'INTC': { symbol: 'INTC', id: 'INTC', finnhubTicker: 'INTC', name: 'Intel Corporation', category: 'Tech', defaultPriceGBP: 20.15 },
  'PALANTIR': { symbol: 'PLTR', id: 'PLTR', finnhubTicker: 'PLTR', name: 'Palantir Technologies Inc.', category: 'Tech', defaultPriceGBP: 24.50 },
  'PLTR': { symbol: 'PLTR', id: 'PLTR', finnhubTicker: 'PLTR', name: 'Palantir Technologies Inc.', category: 'Tech', defaultPriceGBP: 24.50 },
  'COINBASE': { symbol: 'COIN', id: 'COIN', finnhubTicker: 'COIN', name: 'Coinbase Global, Inc.', category: 'Tech', defaultPriceGBP: 205.80 },
  'COIN': { symbol: 'COIN', id: 'COIN', finnhubTicker: 'COIN', name: 'Coinbase Global, Inc.', category: 'Tech', defaultPriceGBP: 205.80 },
  'NETFLIX': { symbol: 'NFLX', id: 'NFLX', finnhubTicker: 'NFLX', name: 'Netflix, Inc.', category: 'Tech', defaultPriceGBP: 612.40 },
  'NFLX': { symbol: 'NFLX', id: 'NFLX', finnhubTicker: 'NFLX', name: 'Netflix, Inc.', category: 'Tech', defaultPriceGBP: 612.40 },
  'DISNEY': { symbol: 'DIS', id: 'DIS', finnhubTicker: 'DIS', name: 'The Walt Disney Company', category: 'Global', defaultPriceGBP: 92.30 },
  'DIS': { symbol: 'DIS', id: 'DIS', finnhubTicker: 'DIS', name: 'The Walt Disney Company', category: 'Global', defaultPriceGBP: 92.30 },
  'COCA COLA': { symbol: 'KO', id: 'KO', finnhubTicker: 'KO', name: 'The Coca-Cola Company', category: 'Global', defaultPriceGBP: 64.20 },
  'COKE': { symbol: 'KO', id: 'KO', finnhubTicker: 'KO', name: 'The Coca-Cola Company', category: 'Global', defaultPriceGBP: 64.20 },
  'KO': { symbol: 'KO', id: 'KO', finnhubTicker: 'KO', name: 'The Coca-Cola Company', category: 'Global', defaultPriceGBP: 64.20 },
  'NIKE': { symbol: 'NKE', id: 'NKE', finnhubTicker: 'NKE', name: 'Nike, Inc.', category: 'Global', defaultPriceGBP: 75.80 },
  'NKE': { symbol: 'NKE', id: 'NKE', finnhubTicker: 'NKE', name: 'Nike, Inc.', category: 'Global', defaultPriceGBP: 75.80 },
  'BOEING': { symbol: 'BA', id: 'BA', finnhubTicker: 'BA', name: 'The Boeing Company', category: 'Global', defaultPriceGBP: 172.50 },
  'BA': { symbol: 'BA', id: 'BA', finnhubTicker: 'BA', name: 'The Boeing Company', category: 'Global', defaultPriceGBP: 172.50 },
  'WALMART': { symbol: 'WMT', id: 'WMT', finnhubTicker: 'WMT', name: 'Walmart Inc.', category: 'Global', defaultPriceGBP: 67.90 },
  'WMT': { symbol: 'WMT', id: 'WMT', finnhubTicker: 'WMT', name: 'Walmart Inc.', category: 'Global', defaultPriceGBP: 67.90 },
  'JPMORGAN': { symbol: 'JPM', id: 'JPM', finnhubTicker: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Global', defaultPriceGBP: 208.40 },
  'JPM': { symbol: 'JPM', id: 'JPM', finnhubTicker: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Global', defaultPriceGBP: 208.40 },

  // Stock Market Indices
  'S&P 500': { symbol: 'S&P 500', id: 'GSPC', finnhubTicker: 'SPY', name: 'S&P 500 Index (SPY)', category: 'Indices', defaultPriceGBP: 412.50 },
  'S&P': { symbol: 'S&P 500', id: 'GSPC', finnhubTicker: 'SPY', name: 'S&P 500 Index (SPY)', category: 'Indices', defaultPriceGBP: 412.50 },
  'SP500': { symbol: 'S&P 500', id: 'GSPC', finnhubTicker: 'SPY', name: 'S&P 500 Index (SPY)', category: 'Indices', defaultPriceGBP: 412.50 },
  'SPY': { symbol: 'S&P 500', id: 'GSPC', finnhubTicker: 'SPY', name: 'S&P 500 Index (SPY)', category: 'Indices', defaultPriceGBP: 412.50 },
  'GSPC': { symbol: 'S&P 500', id: 'GSPC', finnhubTicker: 'SPY', name: 'S&P 500 Index (SPY)', category: 'Indices', defaultPriceGBP: 412.50 },

  'NASDAQ 100': { symbol: 'NASDAQ 100', id: 'IXIC', finnhubTicker: 'QQQ', name: 'Nasdaq 100 Index (QQQ)', category: 'Indices', defaultPriceGBP: 368.20 },
  'NASDAQ': { symbol: 'NASDAQ 100', id: 'IXIC', finnhubTicker: 'QQQ', name: 'Nasdaq 100 Index (QQQ)', category: 'Indices', defaultPriceGBP: 368.20 },
  'QQQ': { symbol: 'NASDAQ 100', id: 'IXIC', finnhubTicker: 'QQQ', name: 'Nasdaq 100 Index (QQQ)', category: 'Indices', defaultPriceGBP: 368.20 },
  'IXIC': { symbol: 'NASDAQ 100', id: 'IXIC', finnhubTicker: 'QQQ', name: 'Nasdaq 100 Index (QQQ)', category: 'Indices', defaultPriceGBP: 368.20 },

  'DOW JONES': { symbol: 'DOW JONES', id: 'DJI', finnhubTicker: 'DIA', name: 'Dow Jones Industrial Average (DIA)', category: 'Indices', defaultPriceGBP: 385.20 },
  'DOW': { symbol: 'DOW JONES', id: 'DJI', finnhubTicker: 'DIA', name: 'Dow Jones Industrial Average (DIA)', category: 'Indices', defaultPriceGBP: 385.20 },
  'DJI': { symbol: 'DOW JONES', id: 'DJI', finnhubTicker: 'DIA', name: 'Dow Jones Industrial Average (DIA)', category: 'Indices', defaultPriceGBP: 385.20 },
  'DIA': { symbol: 'DOW JONES', id: 'DJI', finnhubTicker: 'DIA', name: 'Dow Jones Industrial Average (DIA)', category: 'Indices', defaultPriceGBP: 385.20 },

  'FTSE 100': { symbol: 'FTSE 100', id: 'FTSE100', name: 'FTSE 100 Index (UK)', category: 'Indices', defaultPriceGBP: 8240.50 },
  'FTSE': { symbol: 'FTSE 100', id: 'FTSE100', name: 'FTSE 100 Index (UK)', category: 'Indices', defaultPriceGBP: 8240.50 },
  'FTSE100': { symbol: 'FTSE 100', id: 'FTSE100', name: 'FTSE 100 Index (UK)', category: 'Indices', defaultPriceGBP: 8240.50 },

  'DAX': { symbol: 'DAX 40', id: 'GDAXI', name: 'German DAX 40 Index', category: 'Indices', defaultPriceGBP: 18120.00 },
  'GERMAN DAX': { symbol: 'DAX 40', id: 'GDAXI', name: 'German DAX 40 Index', category: 'Indices', defaultPriceGBP: 18120.00 },

  'NIKKEI': { symbol: 'NIKKEI 225', id: 'N225', name: 'Nikkei 225 Index (Japan)', category: 'Indices', defaultPriceGBP: 38200.00 },
  'NIKKEI 225': { symbol: 'NIKKEI 225', id: 'N225', name: 'Nikkei 225 Index (Japan)', category: 'Indices', defaultPriceGBP: 38200.00 },

  'RUSSELL 2000': { symbol: 'RUSSELL 2000', id: 'IWM', finnhubTicker: 'IWM', name: 'Russell 2000 Small-Cap Index (IWM)', category: 'Indices', defaultPriceGBP: 204.50 },
  'RUSSELL': { symbol: 'RUSSELL 2000', id: 'IWM', finnhubTicker: 'IWM', name: 'Russell 2000 Small-Cap Index (IWM)', category: 'Indices', defaultPriceGBP: 204.50 },

  'VIX': { symbol: 'VIX', id: 'VIX', name: 'CBOE Volatility Index (VIX)', category: 'Indices', defaultPriceGBP: 16.40 },

  // Commodities
  'GOLD': { symbol: 'GOLD', id: 'XAU-USD', finnhubTicker: 'GLD', name: 'Gold Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 1895.40 },
  'GOLD SPOT': { symbol: 'GOLD', id: 'XAU-USD', finnhubTicker: 'GLD', name: 'Gold Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 1895.40 },
  'XAU': { symbol: 'GOLD', id: 'XAU-USD', finnhubTicker: 'GLD', name: 'Gold Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 1895.40 },
  'XAU-USD': { symbol: 'GOLD', id: 'XAU-USD', finnhubTicker: 'GLD', name: 'Gold Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 1895.40 },

  'SILVER': { symbol: 'SILVER', id: 'XAG-USD', finnhubTicker: 'SLV', name: 'Silver Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 22.85 },
  'SILVER SPOT': { symbol: 'SILVER', id: 'XAG-USD', finnhubTicker: 'SLV', name: 'Silver Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 22.85 },
  'XAG': { symbol: 'SILVER', id: 'XAG-USD', finnhubTicker: 'SLV', name: 'Silver Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 22.85 },
  'XAG-USD': { symbol: 'SILVER', id: 'XAG-USD', finnhubTicker: 'SLV', name: 'Silver Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 22.85 },

  'CRUDE OIL': { symbol: 'CRUDE OIL', id: 'OIL-WTI', finnhubTicker: 'USO', name: 'WTI Crude Oil (£ / bbl)', category: 'Commodities', defaultPriceGBP: 61.20 },
  'OIL': { symbol: 'CRUDE OIL', id: 'OIL-WTI', finnhubTicker: 'USO', name: 'WTI Crude Oil (£ / bbl)', category: 'Commodities', defaultPriceGBP: 61.20 },
  'WTI': { symbol: 'CRUDE OIL', id: 'OIL-WTI', finnhubTicker: 'USO', name: 'WTI Crude Oil (£ / bbl)', category: 'Commodities', defaultPriceGBP: 61.20 },
  'OIL-WTI': { symbol: 'CRUDE OIL', id: 'OIL-WTI', finnhubTicker: 'USO', name: 'WTI Crude Oil (£ / bbl)', category: 'Commodities', defaultPriceGBP: 61.20 },

  'BRENT': { symbol: 'BRENT OIL', id: 'OIL-BRENT', name: 'Brent Crude Oil (£ / bbl)', category: 'Commodities', defaultPriceGBP: 65.40 },
  'BRENT OIL': { symbol: 'BRENT OIL', id: 'OIL-BRENT', name: 'Brent Crude Oil (£ / bbl)', category: 'Commodities', defaultPriceGBP: 65.40 },

  'NATURAL GAS': { symbol: 'NAT GAS', id: 'NAT-GAS', finnhubTicker: 'UNG', name: 'Natural Gas Spot (£ / MMBtu)', category: 'Commodities', defaultPriceGBP: 2.45 },
  'NAT GAS': { symbol: 'NAT GAS', id: 'NAT-GAS', finnhubTicker: 'UNG', name: 'Natural Gas Spot (£ / MMBtu)', category: 'Commodities', defaultPriceGBP: 2.45 },
  'GAS': { symbol: 'NAT GAS', id: 'NAT-GAS', finnhubTicker: 'UNG', name: 'Natural Gas Spot (£ / MMBtu)', category: 'Commodities', defaultPriceGBP: 2.45 },

  'COPPER': { symbol: 'COPPER', id: 'COPPER', name: 'High Grade Copper (£ / lb)', category: 'Commodities', defaultPriceGBP: 3.85 },
  'PLATINUM': { symbol: 'PLATINUM', id: 'PLATINUM', name: 'Platinum Spot (£ / oz)', category: 'Commodities', defaultPriceGBP: 740.00 }
};

/**
 * Search and preview matching financial assets from dictionary while user types
 */
export function searchMatchingFinancialDictionary(query: string, currentStocks: Stock[]): Stock[] {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 2) return [];

  const seenIds = new Set<string>(
    currentStocks.flatMap((s) => [s.id.toLowerCase(), s.symbol.toLowerCase()])
  );

  const matchedDictIds = new Set<string>();
  const results: Stock[] = [];

  for (const [key, meta] of Object.entries(FINANCIAL_LOOKUP_MAP)) {
    const targetId = (meta.id || meta.symbol).toLowerCase();
    const targetSymbol = meta.symbol.toLowerCase();
    const targetName = meta.name.toLowerCase();

    if (
      (key.toLowerCase().includes(cleanQuery) || targetSymbol.includes(cleanQuery) || targetName.includes(cleanQuery)) &&
      !seenIds.has(targetId) &&
      !seenIds.has(targetSymbol) &&
      !matchedDictIds.has(targetId)
    ) {
      matchedDictIds.add(targetId);
      results.push({
        id: meta.id || meta.symbol,
        symbol: meta.symbol,
        name: meta.name,
        category: meta.category,
        price: meta.defaultPriceGBP,
        change24h: 1.15,
        previousClose: parseFloat((meta.defaultPriceGBP * 0.99).toFixed(2)),
        dayHigh: parseFloat((meta.defaultPriceGBP * 1.02).toFixed(2)),
        dayLow: parseFloat((meta.defaultPriceGBP * 0.98).toFixed(2)),
        volume: 'Active',
        sparkline: [meta.defaultPriceGBP * 0.98, meta.defaultPriceGBP * 0.99, meta.defaultPriceGBP],
        history: generateMockHistory(meta.defaultPriceGBP),
      });
    }
  }

  return results;
}

/**
 * Finnhub Symbol Search Helper
 */
export async function searchFinnhubSymbol(query: string, apiKey: string): Promise<{ symbol: string; description: string } | null> {
  try {
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.result) && data.result.length > 0) {
        const top = data.result[0];
        if (top && top.symbol) {
          return { symbol: top.symbol, description: top.description || top.symbol };
        }
      }
    }
  } catch (err) {
    console.warn(`Finnhub symbol search failed for query "${query}"`, err);
  }
  return null;
}

/**
 * Fetch live stock / market quote via server proxy API (/api/quote?symbol=...)
 */
export async function fetchLiveQuoteApi(symbol: string): Promise<{ priceUSD: number; change24h: number; highUSD: number; lowUSD: number; prevCloseUSD: number; currency: string } | null> {
  try {
    const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && typeof data.priceUSD === 'number') {
        return {
          priceUSD: data.priceUSD,
          change24h: data.change24h || 0,
          highUSD: data.highUSD || data.priceUSD,
          lowUSD: data.lowUSD || data.priceUSD,
          prevCloseUSD: data.prevCloseUSD || data.priceUSD,
          currency: data.currency || 'USD'
        };
      }
    }
  } catch (err) {
    console.warn(`Live quote API fetch failed for ${symbol}`, err);
  }
  return null;
}

/**
 * Universal Market Symbol Resolver: Dynamically fetches any symbol (Stocks, Crypto, Commodities, Indices, Forex)
 */
export async function fetchAndCreateStockBySymbol(querySymbol: string, apiKey?: string): Promise<Stock | null> {
  const cleanInput = querySymbol.trim().toUpperCase();
  if (!cleanInput) return null;

  const usdToGbp = await getLiveUsdToGbpRate();

  // 1. Check direct match in FINANCIAL_LOOKUP_MAP (e.g. "INTEL", "S&P 500", "DOW JONES", "GOLD", "NATURAL GAS")
  const metaLookup = FINANCIAL_LOOKUP_MAP[cleanInput];
  let targetTicker = metaLookup ? (metaLookup.finnhubTicker || metaLookup.symbol) : cleanInput;
  let assetName = metaLookup ? metaLookup.name : `${cleanInput} Asset`;
  let targetCategory = metaLookup ? metaLookup.category : 'Global';
  let targetId = metaLookup ? (metaLookup.id || metaLookup.symbol) : cleanInput;
  let targetSymbol = metaLookup ? metaLookup.symbol : cleanInput;

  // 2. If API Key available and not matched in map, try Finnhub Search API to resolve ticker
  if (apiKey && !metaLookup) {
    const searchRes = await searchFinnhubSymbol(cleanInput, apiKey);
    if (searchRes) {
      targetTicker = searchRes.symbol;
      assetName = searchRes.description;
      targetSymbol = searchRes.symbol;
      targetId = searchRes.symbol;
    }
  }

  // 3. Fallback Category Auto-Detection if category is still Global
  if (targetCategory === 'Global') {
    const upper = cleanInput.toUpperCase();
    if (['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'BITCOIN', 'ETHEREUM', 'SOLANA', 'CRYPTO'].some((c) => upper.includes(c))) {
      targetCategory = 'Crypto';
    } else if (['GOLD', 'SILVER', 'OIL', 'XAU', 'XAG', 'WTI', 'BRENT', 'GAS', 'COPPER', 'PLATINUM', 'COMMODITY'].some((c) => upper.includes(c))) {
      targetCategory = 'Commodities';
    } else if (['GSPC', 'IXIC', 'DJI', 'FTSE', 'SPY', 'QQQ', 'VIX', '^', 'INDEX', 'INDICES', 'S&P', 'SP500', 'NASDAQ', 'DOW', 'DAX', 'NIKKEI', 'RUSSELL'].some((c) => upper.includes(c))) {
      targetCategory = 'Indices';
    } else if (['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'INTC', 'PLTR', 'NFLX', 'TECH'].some((c) => upper.includes(c))) {
      targetCategory = 'Tech';
    } else if (upper.includes('USD') || upper.includes('EUR') || upper.includes('GBP') || upper.includes('FOREX')) {
      targetCategory = 'Forex';
    } else if (upper.endsWith('.L')) {
      targetCategory = 'UK FTSE 100';
    }
  }

  // 4. Try Finnhub API quote lookup if API key provided
  if (apiKey) {
    const finnhubQuote = await fetchFinnhubQuote(targetTicker, apiKey);
    if (finnhubQuote) {
      const priceGBP = parseFloat((finnhubQuote.priceUSD * usdToGbp).toFixed(2));
      const highGBP = parseFloat((finnhubQuote.high * usdToGbp).toFixed(2));
      const lowGBP = parseFloat((finnhubQuote.low * usdToGbp).toFixed(2));
      const prevGBP = parseFloat((finnhubQuote.prevClose * usdToGbp).toFixed(2));

      return {
        id: targetId,
        symbol: targetSymbol,
        name: assetName,
        category: targetCategory,
        price: priceGBP,
        change24h: finnhubQuote.change24h,
        previousClose: prevGBP,
        dayHigh: highGBP,
        dayLow: lowGBP,
        volume: 'Active',
        sparkline: [prevGBP * 0.98, prevGBP, priceGBP * 0.99, priceGBP],
        history: generateMockHistory(priceGBP),
      };
    }
  }

  // 5. Try live server market quote API (/api/quote?symbol=...)
  const liveQuote = await fetchLiveQuoteApi(targetTicker);
  if (liveQuote) {
    const multiplier = liveQuote.currency === 'GBP' ? 1 : usdToGbp;
    const priceGBP = parseFloat((liveQuote.priceUSD * multiplier).toFixed(2));
    const highGBP = parseFloat((liveQuote.highUSD * multiplier).toFixed(2));
    const lowGBP = parseFloat((liveQuote.lowUSD * multiplier).toFixed(2));
    const prevGBP = parseFloat((liveQuote.prevCloseUSD * multiplier).toFixed(2));

    return {
      id: targetId,
      symbol: targetSymbol,
      name: assetName,
      category: targetCategory,
      price: priceGBP,
      change24h: liveQuote.change24h,
      previousClose: prevGBP,
      dayHigh: highGBP,
      dayLow: lowGBP,
      volume: 'Active',
      sparkline: [prevGBP * 0.98, prevGBP, priceGBP * 0.99, priceGBP],
      history: generateMockHistory(priceGBP),
    };
  }

  // 6. Default lookup price or hash-based simulated price fallback
  const basePriceGBP = metaLookup ? metaLookup.defaultPriceGBP : (() => {
    let hash = 0;
    for (let i = 0; i < cleanInput.length; i++) {
      hash = cleanInput.charCodeAt(i) + ((hash << 5) - hash);
    }
    const factor = (Math.abs(hash) % 350) + 15;
    return parseFloat((factor * (targetCategory === 'Forex' ? 0.01 : 1)).toFixed(2));
  })();

  const change24h = parseFloat(((Math.random() * 6) - 2.5).toFixed(2));
  const prevClose = parseFloat((basePriceGBP / (1 + change24h / 100)).toFixed(2));

  return {
    id: targetId,
    symbol: targetSymbol,
    name: assetName,
    category: targetCategory,
    price: basePriceGBP,
    change24h,
    previousClose: prevClose,
    dayHigh: parseFloat((basePriceGBP * 1.03).toFixed(2)),
    dayLow: parseFloat((basePriceGBP * 0.97).toFixed(2)),
    volume: '15.4M',
    sparkline: [prevClose, prevClose * 1.01, basePriceGBP * 0.99, basePriceGBP],
    history: generateMockHistory(basePriceGBP),
  };
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
      if (cryptoData && cryptoData[stock.id]) {
        updatedCount++;
        const item = cryptoData[stock.id];
        const newPrice = item.priceGbp;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        return {
          ...stock,
          price: newPrice,
          change24h: item.change24h,
          dayHigh: Math.max(stock.dayHigh, newPrice),
          dayLow: Math.min(stock.dayLow, newPrice),
          sparkline: [...stock.sparkline.slice(1), newPrice],
          history: [...stock.history.slice(1), { time: timeStr, price: newPrice }],
        };
      }

      // 2. Stock updates via Finnhub API if user provided an API key
      if (finnhubApiKey && !stock.id.includes('.L') && stock.category !== 'Crypto') {
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

      // 3. Fallback: Live server market quote API (/api/quote?symbol=...)
      const liveQuote = await fetchLiveQuoteApi(stock.symbol || stock.id);
      if (liveQuote) {
        updatedCount++;
        const multiplier = liveQuote.currency === 'GBP' ? 1 : usdToGbp;
        const priceGBP = parseFloat((liveQuote.priceUSD * multiplier).toFixed(2));
        const highGBP = parseFloat((liveQuote.highUSD * multiplier).toFixed(2));
        const lowGBP = parseFloat((liveQuote.lowUSD * multiplier).toFixed(2));
        const prevCloseGBP = parseFloat((liveQuote.prevCloseUSD * multiplier).toFixed(2));

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        return {
          ...stock,
          price: priceGBP,
          change24h: liveQuote.change24h,
          dayHigh: Math.max(stock.dayHigh, highGBP),
          dayLow: Math.min(stock.dayLow, lowGBP),
          previousClose: prevCloseGBP,
          sparkline: [...stock.sparkline.slice(1), priceGBP],
          history: [...stock.history.slice(1), { time: timeStr, price: priceGBP }],
        };
      }

      return stock;
    })
  );

  return { stocks: updatedStocks, updatedCount, fxRate: usdToGbp };
}

/**
 * Simulates real-time live stock price fluctuations
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

/**
 * Helper to check if traditional stock markets (US NYSE/NASDAQ & UK LSE) are currently open.
 * US: Mon-Fri 14:30 to 21:00 UTC (9:30 AM - 4:00 PM EST)
 * UK: Mon-Fri 08:00 to 16:30 UTC
 */
export function isStockMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) {
    return false; // Weekend - stock markets closed
  }

  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const totalMinutes = hour * 60 + minute;

  // US market: 14:30 UTC (870 min) to 21:00 UTC (1260 min)
  const isUSOpen = totalMinutes >= 870 && totalMinutes <= 1260;
  // UK market: 08:00 UTC (480 min) to 16:30 UTC (990 min)
  const isUKOpen = totalMinutes >= 480 && totalMinutes <= 990;

  return isUSOpen || isUKOpen;
}
