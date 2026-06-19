const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
};

export default function Badge({ children, color = 'slate', size = 'sm', className = '' }) {
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${colorMap[color] || colorMap.slate} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const labels = {
    completed: { label: 'Completed', color: 'emerald' },
    'in-progress': { label: 'In Progress', color: 'blue' },
    pending: { label: 'Pending', color: 'amber' },
    delayed: { label: 'Delayed', color: 'red' },
    cancelled: { label: 'Cancelled', color: 'slate' },
    open: { label: 'Open', color: 'amber' },
    resolved: { label: 'Resolved', color: 'emerald' },
    investigating: { label: 'Investigating', color: 'blue' },
    awarded: { label: 'Awarded', color: 'emerald' },
    released: { label: 'Released', color: 'emerald' },
  };
  const config = labels[status?.toLowerCase()] || { label: status, color: 'slate' };
  return <Badge color={config.color}>{config.label}</Badge>;
}
