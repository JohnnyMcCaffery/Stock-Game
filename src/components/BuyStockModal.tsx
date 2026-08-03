import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import type { Stock } from '../types/stock';
import { searchMatchingFinancialDictionary } from '../services/marketData';
import { X, Search, CheckCircle, AlertTriangle, ArrowRight, PlusCircle, Loader } from 'lucide-react';

interface BuyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStock?: Stock | null;
}

export const BuyStockModal: React.FC<BuyStockModalProps> = ({ isOpen, onClose, initialStock }) => {
  const { stocks, summary, buyStock, selectedStock, searchAndAddSymbol, addStockToMarket } = useGame();
  
  const [selectedStockId, setSelectedStockId] = useState<string>(
    initialStock ? initialStock.id : (selectedStock ? selectedStock.id : (stocks[0]?.id || 'AAPL'))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [amountGBP, setAmountGBP] = useState<string>('500');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSearchingSymbol, setIsSearchingSymbol] = useState(false);

  // Synchronize selectedStockId whenever modal is opened or initialStock changes
  useEffect(() => {
    if (isOpen) {
      if (initialStock) {
        setSelectedStockId(initialStock.id);
      } else if (selectedStock) {
        setSelectedStockId(selectedStock.id);
      } else if (stocks.length > 0) {
        setSelectedStockId(stocks[0].id);
      }
      setErrorMessage(null);
      setSuccessMessage(null);
      setSearchQuery('');
    }
  }, [isOpen, initialStock, selectedStock, stocks]);

  if (!isOpen) return null;

  const currentStock =
    stocks.find((s) => s.id === selectedStockId || s.symbol === selectedStockId) ||
    (selectedStock && (selectedStock.id === selectedStockId || selectedStock.symbol === selectedStockId) ? selectedStock : null) ||
    initialStock ||
    selectedStock ||
    stocks[0];

  const numAmount = parseFloat(amountGBP) || 0;
  
  const calculatedShares = currentStock && currentStock.price > 0 ? numAmount / currentStock.price : 0;
  const remainingCash = summary.cashBalance - numAmount;
  const isValidAmount = numAmount > 0 && numAmount <= summary.cashBalance;

  const dictionaryPreviews = searchQuery.trim().length >= 2 ? searchMatchingFinancialDictionary(searchQuery, stocks) : [];

  const savedMatches = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStocks = [...savedMatches, ...dictionaryPreviews];

  const handleSearchAndAdd = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingSymbol(true);
    setErrorMessage(null);

    try {
      const added = await searchAndAddSymbol(searchQuery);
      if (added) {
        setSelectedStockId(added.id);
        setSearchQuery('');
        setSuccessMessage(`Added ${added.symbol} (${added.name}) to market!`);
        setTimeout(() => setSuccessMessage(null), 2500);
      } else {
        setErrorMessage(`Could not resolve ticker "${searchQuery}". Please check ticker or company name.`);
      }
    } catch (err) {
      setErrorMessage('Failed to resolve symbol.');
    } finally {
      setIsSearchingSymbol(false);
    }
  };

  const handleQuickAmount = (val: number | 'max' | 'half' | 'quarter') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (val === 'max') {
      setAmountGBP(summary.cashBalance.toFixed(2));
    } else if (val === 'half') {
      setAmountGBP((summary.cashBalance * 0.5).toFixed(2));
    } else if (val === 'quarter') {
      setAmountGBP((summary.cashBalance * 0.25).toFixed(2));
    } else {
      setAmountGBP(val.toString());
    }
  };

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentStock) {
      setErrorMessage('Please select a valid stock');
      return;
    }

    if (numAmount <= 0) {
      setErrorMessage('Please enter an investment amount greater than £0.00');
      return;
    }
    if (numAmount > summary.cashBalance) {
      setErrorMessage(`Insufficient cash balance. You have £${summary.cashBalance.toFixed(2)} available.`);
      return;
    }

    const res = buyStock(currentStock.id, numAmount);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } else {
      setErrorMessage(res.message);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Invest Cash in {currentStock?.symbol || 'Stock'}</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Select an asset or search any global symbol to add it live.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stock Selector Search */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            SELECT OR SEARCH ASSET TO BUY
          </label>
          
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search ticker (e.g. AAPL, NVDA, Gold, S&P 500, SOL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredStocks.length === 0) {
                    e.preventDefault();
                    handleSearchAndAdd();
                  }
                }}
                className="form-input"
                style={{ paddingLeft: '2.4rem', fontSize: '0.9rem' }}
              />
            </div>

            {searchQuery && filteredStocks.length === 0 && (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSearchAndAdd}
                disabled={isSearchingSymbol}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
              >
                {isSearchingSymbol ? <Loader size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                Add "{searchQuery.toUpperCase()}"
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem', scrollbarWidth: 'none' }}>
            {filteredStocks.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  addStockToMarket(s);
                  setSelectedStockId(s.id);
                  setErrorMessage(null);
                }}
                style={{
                  background: selectedStockId === s.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedStockId === s.id ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  color: selectedStockId === s.id ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{s.symbol}</span>
                <span className="mono" style={{ color: selectedStockId === s.id ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  £{s.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Stock Info Banner */}
        {currentStock && (
          <div className="glass-card" style={{ padding: '0.9rem 1rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {currentStock.category}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentStock.name} ({currentStock.symbol})</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  £{currentStock.price.toFixed(2)}
                </div>
                <span className={currentStock.change24h >= 0 ? 'badge-profit' : 'badge-loss'}>
                  {currentStock.change24h >= 0 ? '+' : ''}{currentStock.change24h}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Investment Amount Input & Presets */}
        <form onSubmit={handleBuy}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                INVESTMENT AMOUNT (£ GBP)
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Available Cash: <strong className="mono" style={{ color: 'var(--accent-emerald)' }}>£{summary.cashBalance.toFixed(2)}</strong>
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <span className="mono" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                £
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={summary.cashBalance}
                value={amountGBP}
                onChange={(e) => {
                  setAmountGBP(e.target.value);
                  setErrorMessage(null);
                }}
                className="form-input"
                style={{ paddingLeft: '2.2rem', fontSize: '1.25rem', fontWeight: 700 }}
                placeholder="0.00"
                autoFocus
              />
            </div>

            {/* Quick Amount Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount(100)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>£100</button>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount(250)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>£250</button>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount(500)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>£500</button>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount(1000)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>£1,000</button>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount('quarter')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>25% Cash</button>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount('half')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>50% Cash</button>
              <button type="button" className="btn-secondary" onClick={() => handleQuickAmount('max')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>MAX Cash</button>
            </div>
          </div>

          {/* Live Order Calculations Box */}
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              ORDER CALCULATION SUMMARY
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shares Acquired</span>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {calculatedShares.toFixed(4)} shares
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cost Per Share</span>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  £{currentStock?.price.toFixed(2) || '0.00'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Money Spent</span>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  £{numAmount.toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Remaining Cash</span>
                <div className={`mono ${remainingCash < 0 ? 'text-loss' : ''}`} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  £{Math.max(0, remainingCash).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--loss-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--profit-green)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!isValidAmount}
              style={{ width: '60%' }}
            >
              Confirm Buy Order <ArrowRight size={16} />
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
