import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { X, Globe, Key, CheckCircle, RefreshCw, ExternalLink, Zap, Edit3, HardDrive } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    apiKey,
    setApiKey,
    dataSourceMode,
    setDataSourceMode,
    refreshLiveMarketData,
    isSyncingLiveApi,
    appTitle,
    setAppTitle,
    appVersion,
    setAppVersion,
    startingBalance,
    setStartingBalance,
    isHardDriveSynced,
  } = useGame();

  const [inputKey, setInputKey] = useState(apiKey);
  const [titleInput, setTitleInput] = useState(appTitle);
  const [versionInput, setVersionInput] = useState(appVersion);
  const [balanceInput, setBalanceInput] = useState(startingBalance.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
    setAppTitle(titleInput.trim() || 'STOCKS GAME');
    setAppVersion(versionInput.trim() || '0.1.0');
    
    const parsedBal = parseFloat(balanceInput);
    if (!isNaN(parsedBal) && parsedBal > 0) {
      setStartingBalance(parsedBal);
    }

    setDataSourceMode(dataSourceMode);
    setSaveSuccess(true);
    refreshLiveMarketData(true);

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <Globe size={22} color="var(--accent-cyan)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>App Configuration & Hard Drive Settings</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Configure real-time stock market data feeds & local disk storage.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>

          {/* 1. Hard Drive Storage Status */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={18} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                    Hard Drive Disk Save File
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Saved to: <code style={{ color: 'var(--accent-emerald)' }}>data/savegame.json</code>
                  </div>
                </div>
              </div>

              <span className="badge-profit" style={{ fontSize: '0.725rem' }}>
                {isHardDriveSynced ? '100% DISK SYNCED' : 'READY'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              All trades, cash balance, portfolio holdings, and API keys are stored directly on your computer disk. Your game data is 100% immune to browser data/cookie wipes. No login required.
            </p>
          </div>

          {/* 2. Editable Page Information Section */}
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <Edit3 size={16} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EDITABLE PAGE INFORMATION & METADATA
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  APPLICATION TITLE
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="form-input"
                  placeholder="e.g. STOCKS GAME"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  VERSION NUMBER (e.g. package.json)
                </label>
                <input
                  type="text"
                  value={versionInput}
                  onChange={(e) => setVersionInput(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 0.1.0"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                DEFAULT STARTING CAPITAL (£ GBP)
              </label>
              <input
                type="number"
                step="100"
                min="100"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="form-input"
                placeholder="5000"
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* 3. Status Indicators */}
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              ACTIVE DATA SOURCES & CONNECTIONS
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              
              {/* CoinGecko */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <Zap size={14} color="var(--accent-gold)" /> Crypto Live Feed (CoinGecko API)
                </span>
                <span className="badge-profit" style={{ fontSize: '0.7rem' }}>KEYLESS LIVE</span>
              </div>

              {/* FX Converter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <Globe size={14} color="var(--accent-cyan)" /> USD / GBP Live FX Exchange Rate
                </span>
                <span className="badge-profit" style={{ fontSize: '0.7rem' }}>EXCHANGE RATE API</span>
              </div>

              {/* Finnhub Stocks */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <Key size={14} color="var(--accent-emerald)" /> Stock Market Live Feed (Finnhub API)
                </span>
                {apiKey ? (
                  <span className="badge-profit" style={{ fontSize: '0.7rem' }}>API KEY CONNECTED</span>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                    KEY OPTIONAL / SIMULATED
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* 4. Data Mode Switch */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              DATA SOURCE ENGINE MODE
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDataSourceMode('LIVE_API')}
                style={{
                  background: dataSourceMode === 'LIVE_API' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))' : 'rgba(255,255,255,0.04)',
                  border: dataSourceMode === 'LIVE_API' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  color: dataSourceMode === 'LIVE_API' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>🌐 Live API Mode</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Pull real live market quotes from web APIs</div>
              </button>

              <button
                type="button"
                onClick={() => setDataSourceMode('SIMULATED')}
                style={{
                  background: dataSourceMode === 'SIMULATED' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))' : 'rgba(255,255,255,0.04)',
                  border: dataSourceMode === 'SIMULATED' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  color: dataSourceMode === 'SIMULATED' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>⚡ Real-Time Ticker Mode</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Continuous price updates every 2.5s</div>
              </button>
            </div>
          </div>

          {/* 5. API Key Form */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                FINNHUB API KEY (FREE)
              </label>
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
              >
                Get Free Key <ExternalLink size={12} />
              </a>
            </div>

            <input
              type="text"
              placeholder="Paste Finnhub API Key here..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          {saveSuccess && (
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--profit-green)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <CheckCircle size={16} /> Saved configuration! Saved to disk & fetching quotes...
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => refreshLiveMarketData(true)}
              disabled={isSyncingLiveApi}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
            >
              <RefreshCw size={14} className={isSyncingLiveApi ? 'animate-spin' : ''} />
              {isSyncingLiveApi ? 'Syncing...' : 'Fetch Live Market Now'}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save & Update Settings
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
