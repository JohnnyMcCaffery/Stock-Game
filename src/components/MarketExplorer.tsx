import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Stock } from '../types/stock';
import { searchMatchingFinancialDictionary } from '../services/marketData';
import { Search, Plus, LineChart, PlusCircle, CheckCircle, Loader } from 'lucide-react';

interface MarketExplorerProps {
  onSelectStock: (stock: Stock) => void;
  onBuyStock: (stock: Stock) => void;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({ onSelectStock, onBuyStock }) => {
  const { stocks, selectedStock, searchAndAddSymbol, addStockToMarket } = useGame();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isSearchingSymbol, setIsSearchingSymbol] = useState(false);
  const [searchStatusMsg, setSearchStatusMsg] = useState<string | null>(null);

  const categories: string[] = ['ALL', 'Tech', 'UK FTSE 100', 'Indices', 'Commodities', 'Crypto', 'Forex'];

  const dictionaryPreviews = search.trim().length >= 2 ? searchMatchingFinancialDictionary(search, stocks) : [];

  const savedMatches = stocks.filter((s) => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const previewMatchesFiltered = dictionaryPreviews.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  const filteredStocks = [...savedMatches, ...previewMatchesFiltered];

  const handleSelectAsset = (stock: Stock) => {
    addStockToMarket(stock);
    onSelectStock(stock);
  };

  const handleBuyAsset = (stock: Stock) => {
    addStockToMarket(stock);
    onBuyStock(stock);
  };

  const handleSearchAndAdd = async () => {
    if (!search.trim()) return;
    setIsSearchingSymbol(true);
    setSearchStatusMsg('Searching live market APIs for symbol...');

    try {
      const addedStock = await searchAndAddSymbol(search);
      if (addedStock) {
        // Auto-switch category filter so the newly added stock is immediately visible
        if (selectedCategory !== 'ALL' && selectedCategory !== addedStock.category) {
          setSelectedCategory(addedStock.category);
        }
        onSelectStock(addedStock);
        setSearchStatusMsg(`Successfully added ${addedStock.symbol} (${addedStock.name}) to saved market!`);
        setTimeout(() => setSearchStatusMsg(null), 3500);
      } else {
        setSearchStatusMsg(`Could not resolve symbol "${search}". Please check ticker or company name.`);
        setTimeout(() => setSearchStatusMsg(null), 3500);
      }
    } catch (err) {
      setSearchStatusMsg('Failed to fetch symbol data.');
    } finally {
      setIsSearchingSymbol(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Global Stock & Financial Asset Explorer</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Explore equities, stock indices, commodities (Gold/Oil), crypto, and forex. Search any ticker to add it permanently.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Universal Symbol Search Bar */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search ticker (e.g. PLTR, GOLD, S&P 500, SOL)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredStocks.length === 0) {
                    handleSearchAndAdd();
                  }
                }}
                className="form-input"
                style={{ paddingLeft: '2rem', fontSize: '0.825rem', padding: '0.4rem 0.6rem 0.4rem 2rem', width: '240px' }}
              />
            </div>

            <button
              onClick={handleSearchAndAdd}
              disabled={isSearchingSymbol || !search.trim()}
              className="btn-secondary"
              title="Search and permanently add new market asset to saved list"
              style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
            >
              {isSearchingSymbol ? <Loader size={14} className="animate-spin" /> : <PlusCircle size={14} color="var(--accent-emerald)" />}
              <span>{isSearchingSymbol ? 'Searching...' : 'Add Symbol'}</span>
            </button>
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

      {searchStatusMsg && (
        <div style={{ padding: '0.6rem 1.5rem', background: 'rgba(6, 182, 212, 0.12)', borderBottom: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '0.825rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={14} /> {searchStatusMsg}
        </div>
      )}

      {/* Grid of Stocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.25rem' }}>
        {filteredStocks.map((s) => {
          const isPositive = s.change24h >= 0;
          const isSelected = selectedStock?.id === s.id;

          return (
            <div
              key={s.id}
              onClick={() => handleSelectAsset(s)}
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
                    handleSelectAsset(s);
                  }}
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.775rem' }}
                >
                  <LineChart size={14} /> Chart
                </button>
                <button
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyAsset(s);
                  }}
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.775rem' }}
                >
                  <Plus size={14} /> Buy
                </button>
              </div>

            </div>
          );
        })}

        {filteredStocks.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No matches found for "{search}"
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Would you like to search live financial market APIs for symbol <strong>"{search}"</strong> and add it to your saved market?
            </p>
            <button className="btn-primary" onClick={handleSearchAndAdd} disabled={isSearchingSymbol}>
              <PlusCircle size={16} /> Search & Add "{search.toUpperCase()}" to Market
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
