import React from 'react';
import type { Stock } from '../types/stock';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockChartProps {
  stock: Stock | null;
  onBuyClick: (stock: Stock) => void;
}

export const StockChart: React.FC<StockChartProps> = ({ stock, onBuyClick }) => {
  if (!stock) return null;

  const isPositive = stock.change24h >= 0;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.12)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              {stock.category}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stock.name} ({stock.symbol})</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-Time Market Price Trend
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              £{stock.price.toFixed(2)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
              <span className={isPositive ? 'badge-profit' : 'badge-loss'}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{stock.change24h}% 24h
              </span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => onBuyClick(stock)} style={{ padding: '0.7rem 1.4rem' }}>
            + Buy {stock.symbol}
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div style={{ width: '100%', height: 260, marginBottom: '1.25rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stock.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickFormatter={(val) => `£${val}`}
            />
            <Tooltip
              contentStyle={{
                background: '#121824',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
              formatter={(val: any) => [`£${Number(val || 0).toFixed(2)}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${stock.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Market Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24h High</span>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--profit-green)' }}>
            £{stock.dayHigh.toFixed(2)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24h Low</span>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--loss-red)' }}>
            £{stock.dayLow.toFixed(2)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prev Close</span>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            £{stock.previousClose.toFixed(2)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24h Volume</span>
          <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            {stock.volume}
          </div>
        </div>
      </div>

    </div>
  );
};
