import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Stock, Holding, Transaction, PortfolioSummary } from '../types/stock';
import { INITIAL_STOCKS, simulateMarketTick, fetchRealTimeMarketData, fetchAndCreateStockBySymbol } from '../services/marketData';
import packageJson from '../../package.json';

const DEFAULT_STARTING_BALANCE = 5000.00;
const LOCAL_STORAGE_KEY = 'stock_game_state_v1';
const API_KEY_STORAGE_KEY = 'stock_game_api_key_v1';

interface GameContextType {
  stocks: Stock[];
  holdings: Holding[];
  transactions: Transaction[];
  summary: PortfolioSummary;
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
  buyStock: (stockId: string, amountGBP: number) => { success: boolean; message: string };
  sellStock: (stockId: string, sharesToSell: number) => { success: boolean; message: string };
  resetGame: (newStartingBalance?: number) => void;
  exportTransactionsCSV: () => void;
  isLiveMarketActive: boolean;
  setIsLiveMarketActive: (active: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  dataSourceMode: 'LIVE_API' | 'SIMULATED';
  setDataSourceMode: (mode: 'LIVE_API' | 'SIMULATED') => void;
  refreshLiveMarketData: () => Promise<void>;
  isSyncingLiveApi: boolean;
  lastLiveSyncTime: string | null;
  appTitle: string;
  setAppTitle: (title: string) => void;
  appVersion: string;
  setAppVersion: (ver: string) => void;
  startingBalance: number;
  setStartingBalance: (bal: number) => void;
  isHardDriveSynced: boolean;
  addStockToMarket: (newStock: Stock) => void;
  searchAndAddSymbol: (symbol: string) => Promise<Stock | null>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);

  // Load saved stock prices & market history from LocalStorage as initial fallback
  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.stocks) && parsed.stocks.length > 0) {
          return parsed.stocks;
        }
      } catch (e) {}
    }
    return INITIAL_STOCKS;
  });

  const [appTitle, setAppTitleState] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.appTitle === 'string') return parsed.appTitle;
      } catch (e) {}
    }
    return 'STOCKS GAME';
  });

  const [customVersion, setCustomVersion] = useState<string | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.customVersion === 'string') return parsed.customVersion;
      } catch (e) {}
    }
    return null;
  });

  const appVersion = customVersion || packageJson.version || '0.1.0';

  const setAppVersion = (ver: string) => {
    setCustomVersion(ver);
  };

  const [startingBalance, setStartingBalanceState] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.startingBalance === 'number' && parsed.startingBalance > 0) return parsed.startingBalance;
      } catch (e) {}
    }
    return DEFAULT_STARTING_BALANCE;
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cashBalance === 'number') return parsed.cashBalance;
      } catch (e) {}
    }
    return startingBalance;
  });

  const [holdingsMap, setHoldingsMap] = useState<Record<string, { sharesOwned: number; totalCost: number; averageCost: number; realisedPL: number }>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.holdingsMap) return parsed.holdingsMap;
      } catch (e) {}
    }
    return {};
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.transactions)) return parsed.transactions;
      } catch (e) {}
    }
    return [];
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    const dedicatedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (dedicatedKey) return dedicatedKey;

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.apiKey === 'string') return parsed.apiKey;
      } catch (e) {}
    }
    return '';
  });

  const [dataSourceMode, setDataSourceMode] = useState<'LIVE_API' | 'SIMULATED'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.dataSourceMode === 'LIVE_API' || parsed.dataSourceMode === 'SIMULATED') return parsed.dataSourceMode;
      } catch (e) {}
    }
    return 'LIVE_API';
  });

  const [selectedStock, setSelectedStock] = useState<Stock | null>(() => stocks[0] || INITIAL_STOCKS[0]);
  const [isLiveMarketActive, setIsLiveMarketActive] = useState<boolean>(true);
  const [isSyncingLiveApi, setIsSyncingLiveApi] = useState<boolean>(false);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<string | null>(null);
  const [isHardDriveSynced, setIsHardDriveSynced] = useState<boolean>(false);

  // Load saved state from Hard Drive File (/api/state -> data/savegame.json) FIRST before enabling auto-save
  useEffect(() => {
    async function loadHardDriveSave() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const diskData = await res.json();
          if (diskData && diskData.exists !== false) {
            setIsHardDriveSynced(true);
            if (Array.isArray(diskData.stocks) && diskData.stocks.length > 0) setStocks(diskData.stocks);
            if (typeof diskData.cashBalance === 'number') setCashBalance(diskData.cashBalance);
            if (diskData.holdingsMap) setHoldingsMap(diskData.holdingsMap);
            if (Array.isArray(diskData.transactions)) setTransactions(diskData.transactions);
            if (typeof diskData.apiKey === 'string') setApiKey(diskData.apiKey);
            if (diskData.dataSourceMode) setDataSourceMode(diskData.dataSourceMode);
            if (diskData.appTitle) setAppTitleState(diskData.appTitle);
            if (typeof diskData.startingBalance === 'number') setStartingBalanceState(diskData.startingBalance);
            if (diskData.customVersion) setCustomVersion(diskData.customVersion);
          }
        }
      } catch (err) {
        console.warn('Hard drive API save file fetch failed, using local browser fallback', err);
      } finally {
        setIsInitialLoadComplete(true);
      }
    }
    loadHardDriveSave();
  }, []);

  // Live market price sync function
  const refreshLiveMarketData = async () => {
    setIsSyncingLiveApi(true);
    try {
      // 1. Gather all unique stock IDs from stocks state, INITIAL_STOCKS, and active holdingsMap
      const currentMap = new Map<string, Stock>();
      INITIAL_STOCKS.forEach((s) => currentMap.set(s.id.toUpperCase(), s));
      stocks.forEach((s) => currentMap.set(s.id.toUpperCase(), s));

      Object.keys(holdingsMap).forEach((id) => {
        const cleanUpper = id.toUpperCase();
        if (!currentMap.has(cleanUpper)) {
          const fallback = INITIAL_STOCKS.find((s) => s.id.toUpperCase() === cleanUpper || s.symbol.toUpperCase() === cleanUpper);
          if (fallback) currentMap.set(cleanUpper, fallback);
        }
      });

      const fullList = Array.from(currentMap.values());
      const res = await fetchRealTimeMarketData(fullList, apiKey);

      setStocks((prev) => {
        const prevMap = new Map<string, Stock>();
        prev.forEach((s) => prevMap.set(s.id.toUpperCase(), s));

        res.stocks.forEach((updated) => {
          prevMap.set(updated.id.toUpperCase(), updated);
        });

        return Array.from(prevMap.values());
      });

      const now = new Date();
      setLastLiveSyncTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed live API refresh', err);
    } finally {
      setIsSyncingLiveApi(false);
    }
  };

  // Fetch live market prices on initial session boot
  useEffect(() => {
    refreshLiveMarketData();
  }, []);

  // Polling interval for market data
  useEffect(() => {
    if (!isLiveMarketActive) return;

    if (dataSourceMode === 'LIVE_API') {
      const interval = setInterval(() => {
        refreshLiveMarketData();
      }, 15000); // Fetch live API every 15 seconds
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setStocks((prevStocks) => simulateMarketTick(prevStocks));
      }, 2500); // Ticker simulation every 2.5 seconds
      return () => clearInterval(interval);
    }
  }, [isLiveMarketActive, dataSourceMode, apiKey]);

  // Keep selectedStock state updated with new live prices
  useEffect(() => {
    if (selectedStock) {
      const updated = stocks.find((s) => s.id === selectedStock.id);
      if (updated && updated.price !== selectedStock.price) {
        setSelectedStock(updated);
      }
    }
  }, [stocks, selectedStock]);

  // Auto-save full session state to BOTH LocalStorage AND Hard Drive File (/data/savegame.json) ONLY AFTER initial load complete!
  useEffect(() => {
    if (!isInitialLoadComplete) return;

    const stateToSave = {
      stocks,
      cashBalance,
      holdingsMap,
      transactions,
      apiKey,
      dataSourceMode,
      appTitle,
      customVersion,
      startingBalance,
      savedAt: new Date().toISOString(),
    };

    // 1. Browser LocalStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }

    // 2. Hard Drive File Server Endpoint (/api/state -> /data/savegame.json)
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stateToSave),
    })
      .then(() => setIsHardDriveSynced(true))
      .catch((err) => console.warn('Hard drive save backup failed', err));

  }, [isInitialLoadComplete, stocks, cashBalance, holdingsMap, transactions, apiKey, dataSourceMode, appTitle, customVersion, startingBalance]);

  // Add a newly searched stock directly to the market catalog and save it
  const addStockToMarket = (newStock: Stock) => {
    setStocks((prev) => {
      const exists = prev.some((s) => s.id.toLowerCase() === newStock.id.toLowerCase() || s.symbol.toLowerCase() === newStock.symbol.toLowerCase());
      if (exists) return prev;
      return [newStock, ...prev];
    });
    setSelectedStock(newStock);
  };

  // Search and resolve any stock/asset symbol globally, auto-adding it to saved market data
  const searchAndAddSymbol = async (symbol: string): Promise<Stock | null> => {
    const cleanSym = symbol.trim().toUpperCase();
    if (!cleanSym) return null;

    const existing = stocks.find((s) => s.symbol.toUpperCase() === cleanSym || s.id.toUpperCase() === cleanSym);
    if (existing) {
      setSelectedStock(existing);
      return existing;
    }

    const fetchedStock = await fetchAndCreateStockBySymbol(cleanSym, apiKey);
    if (fetchedStock) {
      addStockToMarket(fetchedStock);
      return fetchedStock;
    }

    return null;
  };

  // Compute active holdings list and metrics
  const holdings: Holding[] = Object.entries(holdingsMap)
    .filter(([_, data]) => data.sharesOwned > 0.00001 || data.realisedPL !== 0)
    .map(([stockId, data]) => {
      const cleanId = stockId.trim().toLowerCase();
      let stock = stocks.find(
        (s) => s.id.toLowerCase() === cleanId || s.symbol.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId
      );

      if (!stock) {
        stock = INITIAL_STOCKS.find(
          (s) => s.id.toLowerCase() === cleanId || s.symbol.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId
        );
      }

      const symbol = stock ? stock.symbol : stockId;
      const name = stock ? stock.name : stockId;
      const currentPrice = stock && stock.price > 0 ? stock.price : (data.averageCost > 0 ? data.averageCost : 0);
      const currentValue = data.sharesOwned * currentPrice;
      const unrealisedPL = currentValue - data.totalCost;
      const unrealisedPLPercent = data.totalCost > 0 ? (unrealisedPL / data.totalCost) * 100 : 0;

      return {
        stockId: stock ? stock.id : stockId,
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
  const totalReturnPercent = startingBalance > 0 ? ((totalPortfolioValue - startingBalance) / startingBalance) * 100 : 0;

  const summary: PortfolioSummary = {
    startingBalance,
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

    const cleanId = (stockId || '').trim().toLowerCase();
    let stock = stocks.find(
      (s) => s.id.toLowerCase() === cleanId || s.symbol.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId
    );

    if (!stock) {
      stock = INITIAL_STOCKS.find(
        (s) => s.id.toLowerCase() === cleanId || s.symbol.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId
      );
      if (stock) {
        addStockToMarket(stock);
      }
    }

    if (!stock && selectedStock && (selectedStock.id.toLowerCase() === cleanId || selectedStock.symbol.toLowerCase() === cleanId)) {
      stock = selectedStock;
      addStockToMarket(selectedStock);
    }

    if (!stock) {
      return { success: false, message: 'Stock not found' };
    }

    const price = stock.price;
    const targetStockId = stock.id;
    const sharesToBuy = amountGBP / price;
    const newCash = cashBalance - amountGBP;

    setHoldingsMap((prev) => {
      const existing = prev[targetStockId] || { sharesOwned: 0, totalCost: 0, averageCost: 0, realisedPL: 0 };
      const newShares = existing.sharesOwned + sharesToBuy;
      const newCost = existing.totalCost + amountGBP;
      const newAvgCost = newCost / newShares;

      return {
        ...prev,
        [targetStockId]: {
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
    const cleanId = (stockId || '').trim().toLowerCase();

    // 1. Try finding stock in stocks state array
    let stock = stocks.find(
      (s) => s.id.toLowerCase() === cleanId || s.symbol.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId
    );

    // 2. Fallback to INITIAL_STOCKS if missing
    if (!stock) {
      stock = INITIAL_STOCKS.find(
        (s) => s.id.toLowerCase() === cleanId || s.symbol.toLowerCase() === cleanId || s.name.toLowerCase() === cleanId
      );
      if (stock) {
        addStockToMarket(stock);
      }
    }

    const targetStockId = stock ? stock.id : stockId;

    // 3. Find exact key in holdingsMap
    const holdingKey = Object.keys(holdingsMap).find(
      (k) => k.toLowerCase() === cleanId || (stock && k.toLowerCase() === stock.id.toLowerCase()) || (stock && k.toLowerCase() === stock.symbol.toLowerCase())
    ) || targetStockId;

    const existing = holdingsMap[holdingKey] || holdingsMap[targetStockId] || holdingsMap[stockId];
    if (!existing || existing.sharesOwned <= 0) {
      return { success: false, message: 'You do not own any shares of this stock' };
    }

    if (sharesToSell <= 0 || sharesToSell > existing.sharesOwned + 0.001) {
      return { success: false, message: `Invalid share quantity. You own ${existing.sharesOwned.toFixed(4)} shares.` };
    }

    const isFullSale = Math.abs(sharesToSell - existing.sharesOwned) < 0.001 || sharesToSell >= existing.sharesOwned;
    const actualSharesToSell = isFullSale ? existing.sharesOwned : Math.min(sharesToSell, existing.sharesOwned);
    const price = stock && stock.price > 0 ? stock.price : (existing.averageCost > 0 ? existing.averageCost : 0);
    const saleRevenue = actualSharesToSell * price;

    // Realised P/L for sold shares
    const costBasis = actualSharesToSell * existing.averageCost;
    const tradeRealisedPL = saleRevenue - costBasis;

    const newCash = cashBalance + saleRevenue;

    setHoldingsMap((prev) => {
      const item = prev[holdingKey] || prev[targetStockId] || prev[stockId];
      const remainingShares = isFullSale ? 0 : Math.max(0, item.sharesOwned - actualSharesToSell);
      const remainingCost = remainingShares * item.averageCost;

      return {
        ...prev,
        [holdingKey]: {
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
      stockId: targetStockId,
      symbol: stock ? stock.symbol : targetStockId,
      name: stock ? stock.name : targetStockId,
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

  // Reset Game while preserving user's API Key & preferences
  const resetGame = (newStartingBal?: number) => {
    const balToUse = typeof newStartingBal === 'number' && newStartingBal > 0 ? newStartingBal : startingBalance;
    const existingApiKey = apiKey;
    const existingDataMode = dataSourceMode;

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    fetch('/api/state', { method: 'DELETE' }).catch(() => {});

    setCashBalance(balToUse);
    setStartingBalanceState(balToUse);
    setHoldingsMap({});
    setTransactions([]);
    setStocks(INITIAL_STOCKS);
    setSelectedStock(INITIAL_STOCKS[0]);
    setCustomVersion(null);
    setApiKey(existingApiKey);
    setDataSourceMode(existingDataMode);
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
        apiKey,
        setApiKey,
        dataSourceMode,
        setDataSourceMode,
        refreshLiveMarketData,
        isSyncingLiveApi,
        lastLiveSyncTime,
        appTitle,
        setAppTitle: setAppTitleState,
        appVersion,
        setAppVersion,
        startingBalance,
        setStartingBalance: setStartingBalanceState,
        isHardDriveSynced,
        addStockToMarket,
        searchAndAddSymbol,
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
