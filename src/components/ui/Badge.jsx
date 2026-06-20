const colorMap = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/20',
  blue: 'bg-blue-50 text-blue-800 ring-blue-600/15 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/15 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-400/20',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-400/20',
  red: 'bg-red-50 text-red-800 ring-red-600/15 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-400/20',
  brand: 'bg-brand-50 text-brand-800 ring-brand-600/15 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-500/20',
};

export default function Badge({ children, color = 'slate', size = 'sm', className = '', dot = false }) {
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold ring-1 ring-inset ${colorMap[color] || colorMap.slate} ${sizeClass} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : 'bg-slate-400'}`} />}
      {children}
    </span>
  );
}

const STATUS_MAP = {
  planned: { label: 'Planned', color: 'slate' },
  'tender open': { label: 'Tender Open', color: 'blue' },
  ongoing: { label: 'Ongoing', color: 'amber' },
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
  return <Badge color={config.color} dot>{config.label}</Badge>;
}

const RISK_MAP = {
  'Low Risk': 'emerald',
  'Medium Risk': 'amber',
  'High Risk': 'red',
};

export function RiskLevelBadge({ level }) {
  return <Badge color={RISK_MAP[level] || 'slate'} size="lg" dot>{level}</Badge>;
}
