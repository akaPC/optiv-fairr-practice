export const money = (n: number, opts: { compact?: boolean; decimals?: number } = {}): string => {
  if (!Number.isFinite(n)) return '—';
  if (opts.compact) {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(opts.decimals ?? 2)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(opts.decimals ?? 0)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  }
  const rounded = Math.round(n);
  const s = `$${Math.abs(rounded).toLocaleString('en-US')}`;
  return rounded < 0 ? `(${s})` : s;
};

export const pct = (n: number, decimals = 1): string => (Number.isFinite(n) ? `${(n * 100).toFixed(decimals)}%` : '—');

export const num = (n: number, decimals = 1): string =>
  Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';

export const int = (n: number): string => (Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '—');

export const monthLabel = (m: number): string => `M${m}`;

export const monthName = (m: number, launch = { year: 2026, month: 10 }): string => {
  const idx = launch.month - 1 + (m - 1);
  const year = launch.year + Math.floor(idx / 12);
  const month = idx % 12;
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[month]} ${year}`;
};
