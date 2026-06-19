import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const severityConfig = {
  high: { icon: AlertTriangle, color: 'red', bg: 'bg-red-50 border-red-200' },
  medium: { icon: AlertCircle, color: 'amber', bg: 'bg-amber-50 border-amber-200' },
  low: { icon: Info, color: 'blue', bg: 'bg-blue-50 border-blue-200' },
};

const textColors = {
  red: 'text-red-700',
  amber: 'text-amber-700',
  blue: 'text-blue-700',
};

export default function RiskFlag({ flag, compact = false }) {
  const config = severityConfig[flag.severity] || severityConfig.medium;
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${textColors[config.color]}`}>
        <Icon className="h-3 w-3" />
        {flag.label}
      </span>
    );
  }

  return (
    <div className={`flex gap-3 p-3 rounded-xl border ${config.bg}`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${textColors[config.color]}`} />
      <div>
        <p className={`text-sm font-semibold ${textColors[config.color]}`}>{flag.label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{flag.description}</p>
      </div>
    </div>
  );
}

export function RiskFlagList({ flags, compact = false }) {
  if (!flags.length) {
    return (
      <div className="text-sm text-emerald-600 font-medium flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        No risk flags detected
      </div>
    );
  }

  return (
    <div className={`flex ${compact ? 'flex-wrap gap-2' : 'flex-col gap-2'}`}>
      {flags.map((flag) => (
        <RiskFlag key={flag.id} flag={flag} compact={compact} />
      ))}
    </div>
  );
}
