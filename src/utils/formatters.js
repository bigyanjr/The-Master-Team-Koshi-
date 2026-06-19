const currencyFormatter = new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 'Rs. 0';
  return currencyFormatter.format(Number(amount));
}

export function formatCompactCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 'Rs. 0';
  return compactCurrencyFormatter.format(Number(amount));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value, decimals = 0) {
  if (value == null || Number.isNaN(Number(value))) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getStatusColor(status) {
  const map = {
    planned: 'slate',
    'tender open': 'amber',
    ongoing: 'blue',
    completed: 'emerald',
    delayed: 'red',
    pending: 'amber',
    'under review': 'blue',
    verified: 'emerald',
    resolved: 'emerald',
    rejected: 'red',
  };
  return map[status?.toLowerCase()] || 'slate';
}

export function getWardByNo(wards, wardNo) {
  return wards.find((w) => w.number === wardNo);
}
