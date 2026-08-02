import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { History, Download, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export const TransactionLog: React.FC = () => {
  const { transactions, exportTransactionsCSV } = useGame();
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch =
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Header Bar */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Transaction History Log</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Complete audit log of all stock buy and sell orders.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Search filter */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', fontSize: '0.825rem', padding: '0.4rem 0.6rem 0.4rem 2rem', width: '160px' }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              className={`nav-tab ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              All ({transactions.length})
            </button>
            <button
              className={`nav-tab ${filterType === 'BUY' ? 'active' : ''}`}
              onClick={() => setFilterType('BUY')}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              Buy
            </button>
            <button
              className={`nav-tab ${filterType === 'SELL' ? 'active' : ''}`}
              onClick={() => setFilterType('SELL')}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              Sell
            </button>
          </div>

          {/* Download CSV */}
          <button className="btn-secondary" onClick={exportTransactionsCSV} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Download size={14} /> Download Log (.csv)
          </button>
        </div>
      </div>

      {/* Log Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '0.95rem' }}>No transaction history found.</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {transactions.length === 0 ? 'Your buy and sell trade executions will be logged here in real-time.' : 'No trades match your current search/filter.'}
          </span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Order Action</th>
                <th>Stock / Ticker</th>
                <th style={{ textAlign: 'right' }}>Shares</th>
                <th style={{ textAlign: 'right' }}>Execution Price</th>
                <th style={{ textAlign: 'right' }}>Total Order Value</th>
                <th style={{ textAlign: 'right' }}>Realised P/L</th>
                <th style={{ textAlign: 'right' }}>Remaining Cash</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const isBuy = tx.type === 'BUY';
                const isProfit = tx.realisedPL !== undefined && tx.realisedPL >= 0;

                return (
                  <tr key={tx.id}>
                    
                    {/* Timestamp */}
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }} className="mono">
                      {tx.formattedDate}
                    </td>

                    {/* Order Action */}
                    <td>
                      {isBuy ? (
                        <span className="badge-profit" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                          <ArrowDownRight size={12} /> BUY
                        </span>
                      ) : (
                        <span className="badge-loss" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                          <ArrowUpRight size={12} /> SELL
                        </span>
                      )}
                    </td>

                    {/* Stock Symbol & Name */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {tx.symbol} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>({tx.name})</span>
                      </div>
                    </td>

                    {/* Shares */}
                    <td style={{ textAlign: 'right' }} className="mono">
                      {tx.shares.toFixed(4)}
                    </td>

                    {/* Execution Price */}
                    <td style={{ textAlign: 'right' }} className="mono">
                      £{tx.price.toFixed(2)}
                    </td>

                    {/* Total Value */}
                    <td style={{ textAlign: 'right' }} className="mono">
                      <span style={{ fontWeight: 700 }}>£{tx.totalValue.toFixed(2)}</span>
                    </td>

                    {/* Realised P/L */}
                    <td style={{ textAlign: 'right' }}>
                      {tx.realisedPL !== undefined ? (
                        <span className={`mono ${isProfit ? 'text-profit' : 'text-loss'}`} style={{ fontWeight: 700 }}>
                          {isProfit ? '+' : ''}£{tx.realisedPL.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>

                    {/* Remaining Cash */}
                    <td style={{ textAlign: 'right' }} className="mono">
                      £{tx.remainingCash.toFixed(2)}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
