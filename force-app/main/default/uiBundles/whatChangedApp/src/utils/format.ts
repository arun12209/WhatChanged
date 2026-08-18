export function formatNumber(num: number): string {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(num: number): string {
  if (num === null || num === undefined) return '0%';
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(0)}%`;
}

export function truncate(str: string, maxLength = 80): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
