import React from 'react';

export const DEMAND_SYSTEM = {
  1: { label: 'GARBAGE', bg: 'rgba(126, 34, 206, 0.2)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' },
  2: { label: 'TERRIBLE', bg: 'rgba(30, 64, 175, 0.2)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.4)' },
  3: { label: 'BAD', bg: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: 'rgba(248, 113, 113, 0.4)' },
  4: { label: 'LOW', bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.4)' },
  5: { label: 'AVERAGE', bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(52, 211, 153, 0.4)' },
  6: { label: 'DECENT', bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: 'rgba(250, 204, 21, 0.4)' },
  7: { label: 'GOOD', bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.4)' },
  8: { label: 'HIGH', bg: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: 'rgba(34, 211, 238, 0.4)' },
  9: { label: 'VERY HIGH', bg: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' },
  10: { label: 'EXTREME', bg: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: 'rgba(244, 114, 182, 0.4)' },
  11: { label: 'HYPED', bg: 'rgba(255, 204, 0, 0.2)', color: '#ffcc00', border: 'rgba(255, 204, 0, 0.5)' },
};

export const TREND_SYSTEM = {
  'Rising Fast': { label: 'Rising Fast', symbol: '⬆⬆', color: '#10b981' },
  'Rising': { label: 'Rising', symbol: '⬆', color: '#34d399' },
  'Stable': { label: 'Stable', symbol: '↔', color: '#00e5ff' },
  'Unstable': { label: 'Unstable', symbol: '🔄', color: '#f59e0b' },
  'Dropping': { label: 'Dropping', symbol: '⬇', color: '#ff4d4d' },
  'Dropping Fast': { label: 'Dropping Fast', symbol: '⬇⬇', color: '#ff1744' },
  'N/A': { label: 'N/A', symbol: '—', color: '#64748b' },
};

export function getDemandInfo(demand) {
  if (demand === null || demand === undefined || typeof demand !== 'number') {
    return { label: 'N/A', bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)', text: 'N/A' };
  }
  const item = DEMAND_SYSTEM[demand] || DEMAND_SYSTEM[5];
  return {
    ...item,
    text: `${demand}/11`,
    fullLabel: `${demand}/11 (${item.label})`
  };
}

export function getTrendInfo(trend) {
  const norm = (trend || 'Stable').trim();
  if (norm === 'N/A' || !norm) {
    return { label: 'N/A', symbol: '—', color: '#64748b' };
  }
  const item = TREND_SYSTEM[norm] || { label: norm, symbol: '↔', color: '#00e5ff' };
  return item;
}
