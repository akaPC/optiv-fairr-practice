import type { OfferingKey } from '../../model/fairr-model';

export const COLORS = {
  cyan: '#22D3EE',
  cyanDim: '#0891B2',
  cyanDeep: '#155E75',
  amber: '#F59E0B',
  red: '#EF4444',
  slate: '#94A3B8',
  slateDim: '#64748B',
  paper: '#E6EDF3',
  line: '#1F2A37',
};

export const OFFERING_COLORS: Record<OfferingKey, string> = {
  assessment: '#22D3EE',
  sprint: '#0891B2',
  retainer: '#155E75',
  board: '#F59E0B',
  fcAddon: '#94A3B8',
};

export const OFFERING_SHORT: Record<OfferingKey, string> = {
  assessment: 'Assessment',
  sprint: 'Sprint',
  retainer: 'Retainer',
  board: 'Board readout',
  fcAddon: 'FC add-on',
};

export const SCENARIO_COLORS = {
  base: '#22D3EE',
  downside: '#EF4444',
  upside: '#E6EDF3',
  priceWar: '#F59E0B',
};

export const compactMoney = (v: number): string => {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};
