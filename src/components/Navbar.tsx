import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrendingUp, PieChart, History, Globe, Download, RefreshCw, Play, Pause } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'holdings' | 'market' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'holdings' | 'market' | 'logs') => void;
  onOpenBuyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenBuyModal }) => {
  const { resetGame, exportTransactionsCSV, isLiveMarketActive, setIsLiveMarketActive } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    resetGame();
    setShowResetConfirm(false);
  };

  return (
    <header className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <TrendingUp size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              STOCKS<span style={{ color: '#10b981', WebkitTextFillColor: '#10b981' }}>GAME</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Real-Life Stock Market Trading Simulator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <PieChart size={16} /> Portfolio & Trade
          </button>
          <button
            className={`nav-tab ${activeTab === 'holdings' ? 'active' : ''}`}
            onClick={() => setActiveTab('holdings')}
          >
            <TrendingUp size={16} /> Active Holdings
          </button>
          <button
            className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            <Globe size={16} /> Market Explorer
          </button>
          <button
            className={`nav-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <History size={16} /> Transaction Log
          </button>
        </nav>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Quick Trade Button */}
          <button className="btn-primary" onClick={onOpenBuyModal}>
            + Invest Cash
          </button>

          {/* Live Market Simulation Toggle */}
          <button
            className="btn-secondary"
            onClick={() => setIsLiveMarketActive(!isLiveMarketActive)}
            title={isLiveMarketActive ? "Pause Live Price Ticker" : "Resume Live Price Ticker"}
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.825rem' }}
          >
            {isLiveMarketActive ? (
              <>
                <Pause size={14} style={{ color: 'var(--accent-gold)' }} />
                <span className="badge-profit" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>LIVE</span>
              </>
            ) : (
              <>
                <Play size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAUSED</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button className="btn-secondary" onClick={exportTransactionsCSV} title="Download CSV Log File" style={{ padding: '0.6rem 0.8rem' }}>
            <Download size={16} />
          </button>

          {/* Reset Game */}
          <button className="btn-danger" onClick={() => setShowResetConfirm(true)} title="Reset Game to £5000" style={{ padding: '0.6rem 0.8rem' }}>
            <RefreshCw size={16} />
          </button>

        </div>

      </div>

      {/* Reset Game Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--loss-red)' }}>
              Reset Game to £5,000.00?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to reset the simulation? This will clear all holdings, transaction history logs, and reset your available cash to £5,000.00.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleConfirmReset}>
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
