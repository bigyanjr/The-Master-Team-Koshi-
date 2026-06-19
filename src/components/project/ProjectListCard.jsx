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
  generateRiskExplanation,
} from '../../utils/riskEngine';

const riskBorder = {
  'Low Risk': 'border-l-emerald-500',
  'Medium Risk': 'border-l-amber-500',
  'High Risk': 'border-l-red-500',
};

export default function ProjectListCard({ project, wards, allProjects = [] }) {
  const trustScore = calculateTrustScore(project, allProjects);
  const flags = getRiskFlags(project, allProjects);
  const riskLevel = getRiskLevel(project, allProjects);
  const riskExplanation = flags.length > 0 ? generateRiskExplanation(project, allProjects) : null;
  const ward = getWardByNo(wards, project.wardNo);
  const accent = riskBorder[riskLevel.label] || 'border-l-brand-700';

  return (
    <article className={`group relative flex flex-col rounded-xl border border-slate-200/90 border-l-[3px] ${accent} bg-white overflow-hidden card-shadow hover:card-shadow-md transition-all duration-200`}>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 min-w-[2rem] px-2 rounded-md bg-brand-900 text-white text-xs font-bold">
              W{project.wardNo}
            </span>
            <StatusBadge status={project.status} />
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {project.category}
            </span>
          </div>
          <TrustScoreRing score={trustScore} size="sm" />
        </div>

        <Link to={`/projects/${project.id}`} className="block mb-1">
          <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-brand-800 transition-colors line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {ward && (
          <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Ward {ward.number} — {ward.name}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <Wallet className="h-3.5 w-3.5" />
              Allocated Budget
            </div>
            <p className="font-semibold text-slate-900 text-sm">{formatCompactCurrency(project.allocatedBudget)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <Gavel className="h-3.5 w-3.5" />
              Tender Amount
            </div>
            <p className={`font-semibold text-sm ${project.tenderAmount > project.allocatedBudget ? 'text-red-600' : 'text-slate-900'}`}>
              {formatCompactCurrency(project.tenderAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50/80 border border-slate-100 mb-4">
          <div className="p-1.5 rounded-md bg-white text-slate-500 border border-slate-200">
            <HardHat className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Contractor</p>
            <p className="text-sm font-medium text-slate-800 truncate">
              {project.contractorName || 'Not yet assigned'}
            </p>
          </div>
        </div>

        <ProgressBar value={project.progressPercent} className="mb-4" />

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
            {riskExplanation && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{riskExplanation}</p>
            )}
          </div>
        )}

        <Link to={`/projects/${project.id}`} className="mt-auto">
          <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </article>
  );
}
