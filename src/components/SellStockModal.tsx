import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import type { Holding } from '../types/stock';
import { X, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface SellStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: Holding | null;
}

export const SellStockModal: React.FC<SellStockModalProps> = ({ isOpen, onClose, holding }) => {
  const { sellStock, summary } = useGame();
  
  const [sharesInput, setSharesInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !holding) return null;

  const numShares = parseFloat(sharesInput) || 0;
  const isSharesValid = numShares > 0 && numShares <= holding.sharesOwned + 0.000001;

  const currentPrice = holding.currentPrice;
  const saleRevenue = numShares * currentPrice;
  const costBasis = numShares * holding.averageCost;
  const estimatedRealisedPL = saleRevenue - costBasis;
  const isProfit = estimatedRealisedPL >= 0;
  const newCash = summary.cashBalance + saleRevenue;
  const remainingShares = Math.max(0, holding.sharesOwned - numShares);

  const handlePercentageSelect = (pct: number) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const shares = (holding.sharesOwned * (pct / 100));
    setSharesInput(shares.toFixed(4));
  };

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (numShares <= 0) {
      setErrorMessage('Please enter a valid share quantity to sell');
      return;
    }

    if (numShares > holding.sharesOwned + 0.000001) {
      setErrorMessage(`You cannot sell more than your owned ${holding.sharesOwned.toFixed(4)} shares.`);
      return;
    }

    const res = sellStock(holding.stockId, numShares);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Sell Shares</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Liquidate part or all of your {holding.symbol} position.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Position Summary Banner */}
        <div className="glass-card" style={{ padding: '0.9rem 1rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{holding.name} ({holding.symbol})</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Average Purchase Cost: <strong className="mono" style={{ color: '#ffffff' }}>£{holding.averageCost.toFixed(2)}</strong>
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                £{currentPrice.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Price</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
            <span>Shares Owned: <strong className="mono" style={{ color: '#ffffff' }}>{holding.sharesOwned.toFixed(4)}</strong></span>
            <span>Total Position Value: <strong className="mono" style={{ color: '#ffffff' }}>£{holding.currentValue.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Sell Inputs */}
        <form onSubmit={handleSell}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              NUMBER OF SHARES TO SELL
            </label>

            <input
              type="number"
              step="0.0001"
              min="0.0001"
              max={holding.sharesOwned}
              value={sharesInput}
              onChange={(e) => {
                setSharesInput(e.target.value);
                setErrorMessage(null);
              }}
              className="form-input"
              placeholder="e.g. 2.50"
              style={{ fontSize: '1.2rem', fontWeight: 700 }}
              autoFocus
            />

            {/* Quick Percentage Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
              <button type="button" className="btn-secondary" onClick={() => handlePercentageSelect(25)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>25%</button>
              <button type="button" className="btn-secondary" onClick={() => handlePercentageSelect(50)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>50%</button>
              <button type="button" className="btn-secondary" onClick={() => handlePercentageSelect(75)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>75%</button>
              <button type="button" className="btn-secondary" onClick={() => handlePercentageSelect(100)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: 'var(--loss-red)', fontWeight: 700 }}>100% ALL</button>
            </div>
          </div>

          {/* Sale Calculations Box */}
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              ESTIMATED SALE METRICS
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Sale Revenue</span>
                <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  £{saleRevenue.toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Realised P/L for Trade</span>
                <div className={`mono ${numShares > 0 ? (isProfit ? 'text-profit' : 'text-loss') : ''}`} style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {numShares > 0 ? (isProfit ? '+' : '') + `£${estimatedRealisedPL.toFixed(2)}` : '£0.00'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>New Available Cash</span>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  £{newCash.toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Remaining Shares</span>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {remainingShares.toFixed(4)}
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
              className="btn-danger"
              disabled={!isSharesValid}
              style={{ width: '60%' }}
            >
              Confirm Sell Order <ArrowRight size={16} />
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
