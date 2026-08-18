import React from 'react';
import { Zap, Award, BarChart3, TrendingUp, Users, Egg, ShieldCheck, Sparkles } from 'lucide-react';

export default function LiveStatsTicker({
  totalItems = 1531,
  secretCount = 156,
  legendaryCount = 502,
  risingCount = 247,
  activeUsersCount = 37,
}) {
  const tickerItems = [
    {
      icon: <Zap size={15} color="#ffcc00" />,
      label: 'Total Items',
      val: totalItems.toLocaleString(),
      color: '#ffcc00',
    },
    {
      icon: <Award size={15} color="#ff007f" />,
      label: 'Secret Items 👑',
      val: secretCount.toLocaleString(),
      color: '#ff007f',
    },
    {
      icon: <BarChart3 size={15} color="#ffcc00" />,
      label: 'Legendary ⚡',
      val: legendaryCount.toLocaleString(),
      color: '#ffcc00',
    },
    {
      icon: <TrendingUp size={15} color="#00e676" />,
      label: 'High Demand',
      val: risingCount.toLocaleString(),
      color: '#00e676',
    },
    {
      icon: <Users size={15} color="#00e5ff" />,
      label: 'Traders Active',
      val: `${activeUsersCount} Online`,
      color: '#00e5ff',
      isLive: true,
    },
    {
      icon: <Egg size={15} color="#a855f7" />,
      label: 'Egg Hatches',
      val: '140 Eggs',
      color: '#a855f7',
    },
    {
      icon: <ShieldCheck size={15} color="#10b981" />,
      label: 'Collab Sync',
      val: 'Verified 2026',
      color: '#10b981',
    },
    {
      icon: <Sparkles size={15} color="#ffaa00" />,
      label: 'Live Market',
      val: 'Auto-Updated',
      color: '#ffaa00',
    },
  ];

  const renderGroup = (keyPrefix) => (
    <div key={keyPrefix} style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', paddingRight: '2.5rem' }}>
      {tickerItems.map((item, idx) => (
        <div
          key={`${keyPrefix}-${idx}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {item.icon}
          <span
            style={{
              fontWeight: 900,
              color: item.color,
              transition: 'all 0.4s ease',
            }}
          >
            {item.val}
          </span>
          <span>{item.label}</span>
          {item.isLive && <span className="live-pulse-dot" style={{ marginLeft: '2px' }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="ticker-wrap"
      title="Live BGS Trading Hub Telemetry (Hover to pause)"
    >
      <div className="ticker-move">
        {renderGroup('group1')}
        {renderGroup('group2')}
      </div>
    </div>
  );
}
