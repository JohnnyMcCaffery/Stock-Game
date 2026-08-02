import React from 'react';
import { useGame } from '../context/GameContext';
import type { Holding } from '../types/stock';
import { TrendingUp, Plus, DollarSign, ExternalLink } from 'lucide-react';

interface HoldingsTableProps {
  onOpenBuyModalWithStock: (holding: Holding) => void;
  onOpenSellModal: (holding: Holding) => void;
  onSelectStockChart: (stockId: string) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  onOpenBuyModalWithStock,
  onOpenSellModal,
  onSelectStockChart,
}) => {
  const { holdings, summary } = useGame();

  const activeHoldings = holdings.filter((h) => h.sharesOwned > 0.00001);

  if (activeHoldings.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
          <TrendingUp size={30} color="var(--accent-emerald)" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Active Stock Holdings</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
          You currently have no active stock investments. Select a stock to start investing your <strong>£{summary.cashBalance.toFixed(2)}</strong> available cash!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Header bar */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Active Portfolio Holdings</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {activeHoldings.length} open position{activeHoldings.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Total Invested: <strong className="mono" style={{ color: '#ffffff' }}>£{summary.totalInvested.toFixed(2)}</strong>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name / Ticker</th>
              <th style={{ textAlign: 'right' }}>Shares Owned</th>
              <th style={{ textAlign: 'right' }}>Average Cost</th>
              <th style={{ textAlign: 'right' }}>Current Price</th>
              <th style={{ textAlign: 'right' }}>Current Value</th>
              <th style={{ textAlign: 'right' }}>Unrealised P/L</th>
              <th style={{ textAlign: 'right' }}>Realised P/L</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeHoldings.map((h) => {
              const isProfit = h.unrealisedPL >= 0;
              const isRealisedProfit = h.realisedPL >= 0;

              return (
                <tr key={h.stockId}>
                  
                  {/* 1. Name */}
                  <td>
                    <div
                      onClick={() => onSelectStockChart(h.stockId)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                      title="View Price Chart"
                    >
                      <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.4rem 0.6rem', borderRadius: '8px', fontWeight: 800 }} className="mono">
                        {h.symbol}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {h.name}
                          <ExternalLink size={12} color="var(--text-muted)" />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {h.stockId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Shares Owned */}
                  <td style={{ textAlign: 'right' }} className="mono">
                    <span style={{ fontWeight: 700 }}>
                      {h.sharesOwned % 1 === 0 ? h.sharesOwned.toFixed(0) : h.sharesOwned.toFixed(4)}
                    </span>
                  </td>

                  {/* 3. Average Cost */}
                  <td style={{ textAlign: 'right' }} className="mono">
                    £{h.averageCost.toFixed(2)}
                  </td>

                  {/* 4. Current Price */}
                  <td style={{ textAlign: 'right' }} className="mono">
                    <span style={{ fontWeight: 700 }}>
                      £{h.currentPrice.toFixed(2)}
                    </span>
                  </td>

                  {/* 5. Current Value */}
                  <td style={{ textAlign: 'right' }} className="mono">
                    <span style={{ fontWeight: 800, color: '#ffffff' }}>
                      £{h.currentValue.toFixed(2)}
                    </span>
                  </td>

                  {/* 6. Unrealised P/L */}
                  <td style={{ textAlign: 'right' }}>
                    <div className={`mono ${isProfit ? 'text-profit' : 'text-loss'}`} style={{ fontWeight: 700 }}>
                      {isProfit ? '+' : ''}£{h.unrealisedPL.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }} className={isProfit ? 'text-profit' : 'text-loss'}>
                      ({isProfit ? '+' : ''}{h.unrealisedPLPercent.toFixed(2)}%)
                    </div>
                  </td>

                  {/* 7. Realised P/L */}
                  <td style={{ textAlign: 'right' }}>
                    <div className={`mono ${h.realisedPL !== 0 ? (isRealisedProfit ? 'text-profit' : 'text-loss') : ''}`} style={{ fontWeight: 600, color: h.realisedPL === 0 ? 'var(--text-muted)' : undefined }}>
                      {h.realisedPL > 0 ? '+' : ''}£{h.realisedPL.toFixed(2)}
                    </div>
                  </td>

                  {/* 8. Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        className="btn-primary"
                        onClick={() => onOpenBuyModalWithStock(h)}
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem' }}
                        title="Buy More Shares"
                      >
                        <Plus size={14} /> Buy
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => onOpenSellModal(h)}
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--loss-red)' }}
                        title="Sell Shares"
                      >
                        <DollarSign size={14} /> Sell
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
