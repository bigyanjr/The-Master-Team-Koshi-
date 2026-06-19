import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import TrustScoreRing from '../ui/TrustScoreRing';
import { RiskFlagList } from '../ui/RiskFlag';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { calculateTrustScore, getRiskFlags } from '../../utils/riskEngine';

export default function ProjectCard({ project, ward, context, compact = false }) {
  const trustScore = calculateTrustScore(project, context);
  const flags = getRiskFlags(project, context);
  const totalPaid = context.payments
    .filter((p) => p.projectId === project.id)
    .reduce((s, p) => s + p.amount, 0);

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <StatusBadge status={project.status} />
            <span className="text-xs text-slate-400 font-medium">{project.category}</span>
          </div>
          <Link to={`/projects/${project.id}`}>
            <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
              {project.title}
            </h3>
          </Link>
          {ward && (
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="h-3 w-3" />
              Ward {ward.number} — {ward.name}
            </p>
          )}
        </div>
        {!compact && <TrustScoreRing score={trustScore} size="sm" />}
      </div>

      <ProgressBar value={project.progress} showLabel className="mb-3" />

      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div>
          <span className="text-slate-400">Budget</span>
          <p className="font-semibold text-slate-800">{formatCompactCurrency(project.budget)}</p>
        </div>
        <div>
          <span className="text-slate-400">Spent</span>
          <p className="font-semibold text-slate-800">{formatCompactCurrency(totalPaid)}</p>
        </div>
      </div>

      {flags.length > 0 && (
        <div className="mb-3">
          <RiskFlagList flags={flags.slice(0, 2)} compact />
        </div>
      )}

      <Link
        to={`/projects/${project.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        View details
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </Card>
  );
}

export function ProjectRow({ project, ward, context }) {
  const trustScore = calculateTrustScore(project, context);
  const totalPaid = context.payments
    .filter((p) => p.projectId === project.id)
    .reduce((s, p) => s + p.amount, 0);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <StatusBadge status={project.status} />
          <span className="text-xs text-slate-700 truncate">{project.title}</span>
        </div>
        <p className="text-xs text-slate-500">Ward {ward?.number} · {formatCurrency(totalPaid)} spent</p>
      </div>
      <div className="hidden sm:block w-24">
        <ProgressBar value={project.progress} showLabel={false} size="sm" />
      </div>
      <TrustScoreRing score={trustScore} size="sm" />
    </Link>
  );
}
