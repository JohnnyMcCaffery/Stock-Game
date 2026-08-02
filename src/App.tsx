import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { PortfolioMetrics } from './components/PortfolioMetrics';
import { StockChart } from './components/StockChart';
import { HoldingsTable } from './components/HoldingsTable';
import { MarketExplorer } from './components/MarketExplorer';
import { TransactionLog } from './components/TransactionLog';
import { BuyStockModal } from './components/BuyStockModal';
import { SellStockModal } from './components/SellStockModal';
import type { Stock, Holding } from './types/stock';

const MainLayout: React.FC = () => {
  const { selectedStock, setSelectedStock, stocks } = useGame();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'holdings' | 'market' | 'logs'>('dashboard');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyModalInitialStock, setBuyModalInitialStock] = useState<Stock | null>(null);

  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellModalHolding, setSellModalHolding] = useState<Holding | null>(null);

  const handleOpenBuyModal = (stock?: Stock | null) => {
    setBuyModalInitialStock(stock || selectedStock);
    setIsBuyModalOpen(true);
  };

  const handleOpenSellModal = (holding: Holding) => {
    setSellModalHolding(holding);
    setIsSellModalOpen(true);
  };

  const handleOpenBuyFromHolding = (holding: Holding) => {
    const stockObj = stocks.find((s) => s.id === holding.stockId) || null;
    handleOpenBuyModal(stockObj);
  };

  return (
    <div className="app-container">
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBuyModal={() => handleOpenBuyModal(selectedStock)}
      />

      {/* Main Portfolio Summary Cards */}
      <PortfolioMetrics />

      {/* Main Tab Content Views */}
      {activeTab === 'dashboard' && (
        <>
          {/* Interactive Live Stock Chart */}
          <StockChart
            stock={selectedStock}
            onBuyClick={(stock) => handleOpenBuyModal(stock)}
          />

          {/* Active Holdings Breakdown Table */}
          <HoldingsTable
            onOpenBuyModalWithStock={handleOpenBuyFromHolding}
            onOpenSellModal={handleOpenSellModal}
            onSelectStockChart={(stockId) => {
              const matched = stocks.find((s) => s.id === stockId);
              if (matched) setSelectedStock(matched);
            }}
          />
        </>
      )}

      {activeTab === 'holdings' && (
        <HoldingsTable
          onOpenBuyModalWithStock={handleOpenBuyFromHolding}
          onOpenSellModal={handleOpenSellModal}
          onSelectStockChart={(stockId) => {
            const matched = stocks.find((s) => s.id === stockId);
            if (matched) setSelectedStock(matched);
            setActiveTab('dashboard');
          }}
        />
      )}

      {activeTab === 'market' && (
        <>
          <MarketExplorer
            onSelectStock={(stock) => {
              setSelectedStock(stock);
              setActiveTab('dashboard');
            }}
            onBuyStock={(stock) => {
              setSelectedStock(stock);
              handleOpenBuyModal(stock);
            }}
          />
        </>
      )}

      {activeTab === 'logs' && (
        <TransactionLog />
      )}

      {/* Buy Stock Modal */}
      <BuyStockModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialStock={buyModalInitialStock}
      />

      {/* Sell Stock Modal */}
      <SellStockModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        holding={sellModalHolding}
      />

    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}
