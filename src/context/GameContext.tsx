import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Stock, Holding, Transaction, PortfolioSummary } from '../types/stock';
import { INITIAL_STOCKS, simulateMarketTick } from '../services/marketData';

const STARTING_BALANCE = 5000.00;
const LOCAL_STORAGE_KEY = 'stock_game_state_v1';

interface GameContextType {
  stocks: Stock[];
  holdings: Holding[];
  transactions: Transaction[];
  summary: PortfolioSummary;
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
  buyStock: (stockId: string, amountGBP: number) => { success: boolean; message: string };
  sellStock: (stockId: string, sharesToSell: number) => { success: boolean; message: string };
  resetGame: () => void;
  exportTransactionsCSV: () => void;
  isLiveMarketActive: boolean;
  setIsLiveMarketActive: (active: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>(() => INITIAL_STOCKS);

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cashBalance === 'number') return parsed.cashBalance;
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return STARTING_BALANCE;
  });

  const [holdingsMap, setHoldingsMap] = useState<Record<string, { sharesOwned: number; totalCost: number; averageCost: number; realisedPL: number }>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.holdingsMap) return parsed.holdingsMap;
      } catch (e) {
        console.error('Failed to parse saved holdings', e);
      }
    }
    return {};
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.transactions)) return parsed.transactions;
      } catch (e) {
        console.error('Failed to parse saved transactions', e);
      }
    }
    return [];
  });

  const [selectedStock, setSelectedStock] = useState<Stock | null>(INITIAL_STOCKS[0]);
  const [isLiveMarketActive, setIsLiveMarketActive] = useState<boolean>(true);

  // Live market price simulation ticker interval
  useEffect(() => {
    if (!isLiveMarketActive) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) => simulateMarketTick(prevStocks));
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveMarketActive]);

  // Keep selectedStock state updated with new live prices
  useEffect(() => {
    if (selectedStock) {
      const updated = stocks.find((s) => s.id === selectedStock.id);
      if (updated && updated.price !== selectedStock.price) {
        setSelectedStock(updated);
      }
    }
  }, [stocks, selectedStock]);

  // Auto-save to LocalStorage
  useEffect(() => {
    const stateToSave = {
      cashBalance,
      holdingsMap,
      transactions,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [cashBalance, holdingsMap, transactions]);

  // Compute active holdings list and metrics
  const holdings: Holding[] = Object.entries(holdingsMap)
    .filter(([_, data]) => data.sharesOwned > 0.00001 || data.realisedPL !== 0)
    .map(([stockId, data]) => {
      const stock = stocks.find((s) => s.id === stockId);
      const symbol = stock ? stock.symbol : stockId;
      const name = stock ? stock.name : stockId;
      const currentPrice = stock ? stock.price : 0;
      const currentValue = data.sharesOwned * currentPrice;
      const unrealisedPL = currentValue - data.totalCost;
      const unrealisedPLPercent = data.totalCost > 0 ? (unrealisedPL / data.totalCost) * 100 : 0;

      return {
        stockId,
        symbol,
        name,
        sharesOwned: data.sharesOwned,
        totalCost: data.totalCost,
        averageCost: data.averageCost,
        currentPrice,
        currentValue,
        unrealisedPL,
        unrealisedPLPercent,
        realisedPL: data.realisedPL,
      };
    });

  // Calculate portfolio totals
  const totalInvested = holdings.reduce((sum, h) => sum + (h.sharesOwned > 0 ? h.currentValue : 0), 0);
  const totalPortfolioValue = cashBalance + totalInvested;
  const totalUnrealisedPL = holdings.reduce((sum, h) => sum + (h.sharesOwned > 0 ? h.unrealisedPL : 0), 0);
  const totalRealisedPL = Object.values(holdingsMap).reduce((sum, h) => sum + h.realisedPL, 0);
  const totalReturnPercent = ((totalPortfolioValue - STARTING_BALANCE) / STARTING_BALANCE) * 100;

  const summary: PortfolioSummary = {
    startingBalance: STARTING_BALANCE,
    cashBalance,
    totalInvested,
    totalPortfolioValue,
    totalUnrealisedPL,
    totalRealisedPL,
    totalReturnPercent,
  };

  // Buy Stock Logic
  const buyStock = (stockId: string, amountGBP: number): { success: boolean; message: string } => {
    if (amountGBP <= 0) {
      return { success: false, message: 'Investment amount must be greater than £0.00' };
    }
    if (amountGBP > cashBalance) {
      return { success: false, message: `Insufficient cash available (£${cashBalance.toFixed(2)} available)` };
    }

    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) {
      return { success: false, message: 'Stock not found' };
    }

    const price = stock.price;
    const sharesToBuy = amountGBP / price;
    const newCash = cashBalance - amountGBP;

    setHoldingsMap((prev) => {
      const existing = prev[stockId] || { sharesOwned: 0, totalCost: 0, averageCost: 0, realisedPL: 0 };
      const newShares = existing.sharesOwned + sharesToBuy;
      const newCost = existing.totalCost + amountGBP;
      const newAvgCost = newCost / newShares;

      return {
        ...prev,
        [stockId]: {
          sharesOwned: newShares,
          totalCost: newCost,
          averageCost: newAvgCost,
          realisedPL: existing.realisedPL,
        },
      };
    });

    setCashBalance(newCash);

    const now = new Date();
    const newTx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'BUY',
      stockId: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      shares: sharesToBuy,
      price: price,
      totalValue: amountGBP,
      remainingCash: newCash,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Successfully bought ${sharesToBuy.toFixed(4)} shares of ${stock.symbol} for £${amountGBP.toFixed(2)}`,
    };
  };

  // Sell Stock Logic
  const sellStock = (stockId: string, sharesToSell: number): { success: boolean; message: string } => {
    const existing = holdingsMap[stockId];
    if (!existing || existing.sharesOwned <= 0) {
      return { success: false, message: 'You do not own any shares of this stock' };
    }

    if (sharesToSell <= 0 || sharesToSell > existing.sharesOwned + 0.000001) {
      return { success: false, message: `Invalid share quantity. You own ${existing.sharesOwned.toFixed(4)} shares.` };
    }

    const actualSharesToSell = Math.min(sharesToSell, existing.sharesOwned);
    const stock = stocks.find((s) => s.id === stockId);
    const price = stock ? stock.price : 0;
    const saleRevenue = actualSharesToSell * price;

    // Realised P/L for sold shares
    const costBasis = actualSharesToSell * existing.averageCost;
    const tradeRealisedPL = saleRevenue - costBasis;

    const newCash = cashBalance + saleRevenue;

    setHoldingsMap((prev) => {
      const item = prev[stockId];
      const remainingShares = Math.max(0, item.sharesOwned - actualSharesToSell);
      const remainingCost = remainingShares * item.averageCost;

      return {
        ...prev,
        [stockId]: {
          sharesOwned: remainingShares,
          totalCost: remainingCost,
          averageCost: remainingShares > 0 ? item.averageCost : 0,
          realisedPL: item.realisedPL + tradeRealisedPL,
        },
      };
    });

    setCashBalance(newCash);

    const now = new Date();
    const newTx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SELL',
      stockId,
      symbol: stock ? stock.symbol : stockId,
      name: stock ? stock.name : stockId,
      shares: actualSharesToSell,
      price: price,
      totalValue: saleRevenue,
      realisedPL: tradeRealisedPL,
      remainingCash: newCash,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Successfully sold ${actualSharesToSell.toFixed(4)} shares for £${saleRevenue.toFixed(2)} (Realised P/L: ${tradeRealisedPL >= 0 ? '+' : ''}£${tradeRealisedPL.toFixed(2)})`,
    };
  };

  // Reset Game to Initial £5000 State
  const resetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCashBalance(STARTING_BALANCE);
    setHoldingsMap({});
    setTransactions([]);
    setStocks(INITIAL_STOCKS);
    setSelectedStock(INITIAL_STOCKS[0]);
  };

  // Export Transactions Log as CSV file
  const exportTransactionsCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions recorded yet to export.');
      return;
    }

    const headers = ['Timestamp', 'Type', 'Symbol', 'Name', 'Shares', 'Price (£)', 'Total Value (£)', 'Realised P/L (£)', 'Remaining Cash (£)'];
    const rows = transactions.map((t) => [
      `"${t.formattedDate}"`,
      t.type,
      t.symbol,
      `"${t.name}"`,
      t.shares.toFixed(4),
      t.price.toFixed(2),
      t.totalValue.toFixed(2),
      t.realisedPL !== undefined ? t.realisedPL.toFixed(2) : 'N/A',
      t.remainingCash.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stock_Game_Transactions_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <GameContext.Provider
      value={{
        stocks,
        holdings,
        transactions,
        summary,
        selectedStock,
        setSelectedStock,
        buyStock,
        sellStock,
        resetGame,
        exportTransactionsCSV,
        isLiveMarketActive,
        setIsLiveMarketActive,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
