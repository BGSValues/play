import React from 'react';

export const DEMAND_SYSTEM = {
  1: { label: 'GARBAGE', bg: '#800080', color: '#ffffff', border: '#a855f7' },
  2: { label: 'TERRIBLE', bg: '#0000ff', color: '#ffffff', border: '#3b82f6' },
  3: { label: 'BAD', bg: '#38bdf8', color: '#000000', border: '#0284c7' },
  4: { label: 'LOW', bg: '#00ffff', color: '#000000', border: '#06b6d4' },
  5: { label: 'AVERAGE', bg: '#00ff00', color: '#000000', border: '#16a34a' },
  6: { label: 'DECENT', bg: '#ffff00', color: '#000000', border: '#ca8a04' },
  7: { label: 'GOOD', bg: '#ff8000', color: '#000000', border: '#ea580c' },
  8: { label: 'HIGH', bg: '#ff0000', color: '#ffffff', border: '#dc2626' },
  9: { label: 'VERY HIGH', bg: '#800000', color: '#ffffff', border: '#991b1b' },
  10: { label: 'EXTREME', bg: '#ff00ff', color: '#ffffff', border: '#c026d3' },
  11: { label: 'HYPED', bg: '#ffffff', color: '#000000', border: '#e2e8f0' },
};

export const TREND_SYSTEM = {
  'Rising Fast': { label: 'Rising Fast', symbol: '⬆⬆', color: '#10b981' },
  'Rising': { label: 'Rising', symbol: '⬆', color: '#34d399' },
  'Stable': { label: 'Stable', symbol: '↔', color: '#00e5ff' },
  'Unstable': { label: 'Unstable', symbol: '🔄', color: '#f59e0b' },
  'Dropping': { label: 'Dropping', symbol: '⬇', color: '#ff4d4d' },
  'Dropping Fast': { label: 'Dropping Fast', symbol: '⬇⬇', color: '#ff1744' },
};

export function getDemandInfo(demand) {
  if (demand === null || demand === undefined || typeof demand !== 'number') {
    return { label: 'N/A', bg: '#64748b', color: '#cbd5e1', border: '#475569', text: 'N/A' };
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
  const item = TREND_SYSTEM[norm] || { label: norm, symbol: '↔', color: '#00e5ff' };
  return item;
}
