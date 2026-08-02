import React from 'react';
import { useGame } from '../context/GameContext';
import { Wallet, DollarSign, PieChart, TrendingUp, Award } from 'lucide-react';

export const PortfolioMetrics: React.FC = () => {
  const { summary } = useGame();

  const isProfit = summary.totalUnrealisedPL >= 0;
  const isRealisedProfit = summary.totalRealisedPL >= 0;

  return (
    <div className="grid-metrics">
      
      {/* Cash Available */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Available Cash</span>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem', borderRadius: '8px' }}>
            <Wallet size={18} color="var(--accent-emerald)" />
          </div>
        </div>
        <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          £{summary.cashBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Starting Capital: £{summary.startingBalance.toLocaleString('en-GB')}
        </div>
      </div>

      {/* Invested Amount */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Money Invested</span>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.4rem', borderRadius: '8px' }}>
            <DollarSign size={18} color="var(--accent-cyan)" />
          </div>
        </div>
        <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          £{summary.totalInvested.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Active Stocks Holdings Value
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Portfolio Value</span>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.4rem', borderRadius: '8px' }}>
            <PieChart size={18} color="var(--accent-gold)" />
          </div>
        </div>
        <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
          £{summary.totalPortfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
          <span className={summary.totalReturnPercent >= 0 ? 'badge-profit' : 'badge-loss'}>
            {summary.totalReturnPercent >= 0 ? '+' : ''}{summary.totalReturnPercent.toFixed(2)}% Overall
          </span>
        </div>
      </div>

      {/* Unrealised P/L */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unrealised P/L</span>
          <div style={{ background: isProfit ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '0.4rem', borderRadius: '8px' }}>
            <TrendingUp size={18} color={isProfit ? 'var(--profit-green)' : 'var(--loss-red)'} />
          </div>
        </div>
        <div className={`mono ${isProfit ? 'text-profit' : 'text-loss'}`} style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isProfit ? '+' : ''}£{summary.totalUnrealisedPL.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Open Positions Profit / Loss
        </div>
      </div>

      {/* Realised P/L */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Realised P/L</span>
          <div style={{ background: isRealisedProfit ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '0.4rem', borderRadius: '8px' }}>
            <Award size={18} color={isRealisedProfit ? 'var(--profit-green)' : 'var(--loss-red)'} />
          </div>
        </div>
        <div className={`mono ${isRealisedProfit ? 'text-profit' : 'text-loss'}`} style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isRealisedProfit ? '+' : ''}£{summary.totalRealisedPL.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Closed Trades Net Profit / Loss
        </div>
      </div>

    </div>
  );
};
