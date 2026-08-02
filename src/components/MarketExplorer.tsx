import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Stock } from '../types/stock';
import { Search, Plus, LineChart } from 'lucide-react';

interface MarketExplorerProps {
  onSelectStock: (stock: Stock) => void;
  onBuyStock: (stock: Stock) => void;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({ onSelectStock, onBuyStock }) => {
  const { stocks, selectedStock } = useGame();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: string[] = ['ALL', 'Tech', 'UK FTSE 100', 'Healthcare', 'Energy', 'Crypto'];

  const filteredStocks = stocks.filter((s) => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Real-Time Stock Market Explorer</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Live market data feed for top UK FTSE 100 & Global Stocks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search ticker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', fontSize: '0.825rem', padding: '0.4rem 0.6rem 0.4rem 2rem', width: '180px' }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))' : 'rgba(255,255,255,0.04)',
                  border: selectedCategory === cat ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Grid of Stocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.25rem' }}>
        {filteredStocks.map((s) => {
          const isPositive = s.change24h >= 0;
          const isSelected = selectedStock?.id === s.id;

          return (
            <div
              key={s.id}
              onClick={() => onSelectStock(s)}
              className="glass-card"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--accent-emerald)' : undefined,
                background: isSelected ? 'rgba(16, 185, 129, 0.06)' : undefined,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {s.category}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{s.symbol}</h4>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    £{s.price.toFixed(2)}
                  </div>
                  <span className={isPositive ? 'badge-profit' : 'badge-loss'} style={{ fontSize: '0.725rem', padding: '0.1rem 0.4rem' }}>
                    {isPositive ? '+' : ''}{s.change24h}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStock(s);
                  }}
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.775rem' }}
                >
                  <LineChart size={14} /> Chart
                </button>
                <button
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuyStock(s);
                  }}
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.775rem' }}
                >
                  <Plus size={14} /> Buy
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
