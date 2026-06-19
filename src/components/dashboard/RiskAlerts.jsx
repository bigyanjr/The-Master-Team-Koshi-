import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { StatusBadge, RiskLevelBadge } from '../ui/Badge';
import { RiskFlagList } from '../ui/RiskFlag';
import { formatCompactCurrency } from '../../utils/formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
  getTotalPaid,
} from '../../utils/riskEngine';

export default function RiskAlerts({ projects, limit = 5 }) {
  const risky = [...projects]
    .sort((a, b) => calculateTrustScore(a) - calculateTrustScore(b))
    .slice(0, limit);

  if (!risky.length) return null;

  return (
    <Card>
      <CardHeader
        title="Risk Alerts"
        subtitle="Projects requiring citizen or auditor attention"
      />
      <div className="space-y-4">
        {risky.map((project) => {
          const score = calculateTrustScore(project);
          const flags = getRiskFlags(project);
          const risk = getRiskLevel(project);
          const spent = getTotalPaid(project);

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-red-200/60 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={project.status} />
                  <RiskLevelBadge level={risk.label} />
                  <span className="text-xs font-bold text-slate-500">Trust {score}</span>
                </div>
                <AlertTriangle className={`h-4 w-4 shrink-0 ${score < 50 ? 'text-red-500' : score < 80 ? 'text-amber-500' : 'text-slate-300'}`} />
              </div>
              <h4 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                {project.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Ward {project.wardNo} · {formatCompactCurrency(spent)} spent · {project.progressPercent}% complete
              </p>
              {flags.length > 0 && (
                <div className="mt-3">
                  <RiskFlagList flags={flags} compact />
                </div>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                View project <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
