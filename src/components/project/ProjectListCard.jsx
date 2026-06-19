import { Link } from 'react-router-dom';
import {
  MapPin, HardHat, Wallet, Gavel, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { StatusBadge, RiskLevelBadge } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import TrustScoreRing from '../ui/TrustScoreRing';
import { RiskFlagList } from '../ui/RiskFlag';
import Button from '../ui/Button';
import { formatCompactCurrency, getWardByNo } from '../../utils/formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
} from '../../utils/riskEngine';

const riskAccent = {
  'Low Risk': 'from-emerald-500 to-emerald-600',
  'Medium Risk': 'from-amber-400 to-amber-500',
  'High Risk': 'from-red-500 to-red-600',
};

export default function ProjectListCard({ project, wards }) {
  const trustScore = calculateTrustScore(project);
  const flags = getRiskFlags(project);
  const riskLevel = getRiskLevel(project);
  const ward = getWardByNo(wards, project.wardNo);
  const accent = riskAccent[riskLevel.label] || 'from-brand-500 to-brand-600';

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white overflow-hidden card-shadow hover:shadow-xl hover:shadow-brand-900/5 hover:border-brand-200/60 transition-all duration-300 hover:-translate-y-0.5">
      {/* Risk accent strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 min-w-[2rem] px-2 rounded-lg bg-brand-900 text-white text-xs font-bold">
              W{project.wardNo}
            </span>
            <StatusBadge status={project.status} />
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {project.category}
            </span>
          </div>
          <TrustScoreRing score={trustScore} size="sm" />
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block mb-1">
          <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {ward && (
          <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Ward {ward.number} — {ward.name}
          </p>
        )}

        {/* Budget & tender */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-brand-50/80 border border-brand-100/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-brand-600 mb-1">
              <Wallet className="h-3.5 w-3.5" />
              Allocated Budget
            </div>
            <p className="font-bold text-slate-900">{formatCompactCurrency(project.allocatedBudget)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50/80 border border-emerald-100/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
              <Gavel className="h-3.5 w-3.5" />
              Tender Amount
            </div>
            <p className={`font-bold ${project.tenderAmount > project.allocatedBudget ? 'text-red-600' : 'text-slate-900'}`}>
              {formatCompactCurrency(project.tenderAmount)}
            </p>
          </div>
        </div>

        {/* Contractor */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
          <div className="p-1.5 rounded-lg bg-white text-slate-500 border border-slate-200">
            <HardHat className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Contractor</p>
            <p className="text-sm font-medium text-slate-800 truncate">
              {project.contractorName || 'Not yet assigned'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar value={project.progressPercent} className="mb-4" />

        {/* Risk level + flags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <RiskLevelBadge level={riskLevel.label} />
          {flags.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
              <AlertTriangle className="h-3 w-3" />
              {flags.length} flag{flags.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {flags.length > 0 && (
          <div className="mb-4">
            <RiskFlagList flags={flags.slice(0, 2)} compact />
          </div>
        )}

        {/* CTA */}
        <Link to={`/projects/${project.id}`} className="mt-auto">
          <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </article>
  );
}
