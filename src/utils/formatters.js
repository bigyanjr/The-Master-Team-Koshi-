const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '₹0';
  return currencyFormatter.format(Number(amount));
}

export function formatCompactCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '₹0';
  return compactCurrencyFormatter.format(Number(amount));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
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
    completed: 'emerald',
    'in-progress': 'blue',
    pending: 'amber',
    delayed: 'red',
    cancelled: 'slate',
    open: 'amber',
    resolved: 'emerald',
    investigating: 'blue',
    rejected: 'red',
    verified: 'emerald',
    unverified: 'amber',
  };
  return map[status?.toLowerCase()] || 'slate';
}
