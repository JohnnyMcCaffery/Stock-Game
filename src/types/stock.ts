export type StockCategory = 'Tech' | 'UK FTSE 100' | 'Finance' | 'Energy' | 'Crypto' | 'Healthcare';

export interface StockHistoryPoint {
  time: string;
  price: number;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  category: StockCategory;
  price: number; // In £ GBP
  change24h: number; // percentage
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: string;
  sparkline: number[];
  history: StockHistoryPoint[];
}

export interface Holding {
  stockId: string;
  symbol: string;
  name: string;
  sharesOwned: number;
  totalCost: number; // Total amount paid for active shares
  averageCost: number; // totalCost / sharesOwned
  currentPrice: number;
  currentValue: number; // sharesOwned * currentPrice
  unrealisedPL: number; // currentValue - totalCost
  unrealisedPLPercent: number; // (unrealisedPL / totalCost) * 100
  realisedPL: number; // Profit/Loss generated from previous sales of this stock
}

export interface Transaction {
  id: string;
  timestamp: string;
  formattedDate: string;
  type: 'BUY' | 'SELL';
  stockId: string;
  symbol: string;
  name: string;
  shares: number;
  price: number; // Price per share in £
  totalValue: number; // Total transaction amount in £
  realisedPL?: number; // Realized P/L for SELL trades
  remainingCash: number; // Remaining cash after trade
}

export interface PortfolioSummary {
  startingBalance: number;
  cashBalance: number;
  totalInvested: number;
  totalPortfolioValue: number;
  totalUnrealisedPL: number;
  totalRealisedPL: number;
  totalReturnPercent: number;
}
