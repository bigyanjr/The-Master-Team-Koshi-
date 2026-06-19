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

const STATUS_MAP = {
  planned: { label: 'Planned', color: 'slate' },
  'tender open': { label: 'Tender Open', color: 'amber' },
  ongoing: { label: 'Ongoing', color: 'blue' },
  completed: { label: 'Completed', color: 'emerald' },
  delayed: { label: 'Delayed', color: 'red' },
  pending: { label: 'Pending', color: 'amber' },
  'under review': { label: 'Under Review', color: 'blue' },
  verified: { label: 'Verified', color: 'emerald' },
  resolved: { label: 'Resolved', color: 'emerald' },
  rejected: { label: 'Rejected', color: 'red' },
  released: { label: 'Released', color: 'emerald' },
};

export function StatusBadge({ status }) {
  const config = STATUS_MAP[status?.toLowerCase()] || { label: status, color: 'slate' };
  return <Badge color={config.color}>{config.label}</Badge>;
}

export function RiskLevelBadge({ level }) {
  const colors = { 'Low Risk': 'emerald', 'Medium Risk': 'amber', 'High Risk': 'red' };
  return <Badge color={colors[level] || 'slate'} size="lg">{level}</Badge>;
}
