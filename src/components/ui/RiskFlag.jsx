import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const severityConfig = {
  high: {
    icon: AlertTriangle,
    bg: 'bg-red-50/80 border-red-200/70',
    title: 'text-red-800',
    desc: 'text-slate-600',
    iconColor: 'text-red-600',
  },
  medium: {
    icon: AlertCircle,
    bg: 'bg-amber-50/80 border-amber-200/70',
    title: 'text-amber-900',
    desc: 'text-slate-600',
    iconColor: 'text-amber-600',
  },
  low: {
    icon: Info,
    bg: 'bg-blue-50/80 border-blue-200/70',
    title: 'text-blue-900',
    desc: 'text-slate-600',
    iconColor: 'text-blue-600',
  },
};

export default function RiskFlag({ flag, compact = false }) {
  const config = severityConfig[flag.severity] || severityConfig.medium;
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${config.bg} ${config.title}`}>
        <Icon className="h-3 w-3 shrink-0" />
        {flag.label}
      </span>
    );
  }

  return (
    <div className={`flex gap-3 p-3.5 rounded-lg border ${config.bg}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold leading-snug ${config.title}`}>{flag.label}</p>
        <p className={`text-xs mt-1 leading-relaxed ${config.desc}`}>{flag.description}</p>
      </div>
    </div>
  );
}

export function RiskFlagList({ flags, compact = false }) {
  if (!flags.length) {
    return (
      <div className="text-sm text-emerald-700 font-medium flex items-center gap-2 py-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        No transparency flags
      </div>
    );
  }

  return (
    <div className={`flex ${compact ? 'flex-wrap gap-1.5' : 'flex-col gap-2'}`}>
      {flags.map((flag) => (
        <RiskFlag key={flag.id} flag={flag} compact={compact} />
      ))}
    </div>
  );
}
