import { Link } from 'react-router-dom';
import { HardHat, Wallet, ArrowRight } from 'lucide-react';
import { RiskLevelBadge } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import { formatCompactCurrency } from '../../utils/formatters';
import { formatWardLabel } from '../../constants/wards';
import { getRiskLevel } from '../../utils/riskEngine';

const riskBorder = {
  'Low Risk': 'border-l-emerald-500',
  'Medium Risk': 'border-l-amber-500',
  'High Risk': 'border-l-red-500',
};

export default function ProjectListCard({ project, allProjects = [] }) {
  const riskLevel = getRiskLevel(project, allProjects);
  const accent = riskBorder[riskLevel.label] || 'border-l-brand-700';

  return (
    <article className={`flex flex-col rounded-2xl border border-slate-200/90 border-l-4 ${accent} bg-white p-5 sm:p-6 card-shadow hover:card-shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-900 text-white text-sm font-bold">
          {formatWardLabel(project.wardNo)}
        </span>
        <RiskLevelBadge level={riskLevel.label} />
      </div>

      <h3 className="text-lg font-bold text-brand-950 leading-snug mb-4">
        {project.title}
      </h3>

      <div className="space-y-3 mb-4 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Wallet className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-slate-500">Budget</span>
          <span className="font-semibold text-slate-900 ml-auto">{formatCompactCurrency(project.allocatedBudget)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <HardHat className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-slate-500">Contractor</span>
          <span className="font-medium text-slate-800 ml-auto truncate max-w-[55%] text-right">
            {project.contractorName || 'Not assigned'}
          </span>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-500">Progress</span>
            <span className="font-bold text-brand-800">{project.progressPercent}%</span>
          </div>
          <ProgressBar value={project.progressPercent} showLabel={false} size="sm" />
        </div>
      </div>

      <Link to={`/projects/${project.id}`} className="mt-auto">
        <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
          View Details
        </Button>
      </Link>
    </article>
  );
}
