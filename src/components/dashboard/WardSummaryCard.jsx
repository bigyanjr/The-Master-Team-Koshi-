import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Clock } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { formatCompactCurrency } from '../../utils/formatters';
import { aggregateWardStats } from '../../utils/riskEngine';

export default function WardSummaryCard({ ward, projects }) {
  const stats = aggregateWardStats(ward.number, projects);
  const wardProjects = projects.filter((p) => p.wardNo === ward.number);
  const delayedCount = wardProjects.filter((p) => p.status === 'Delayed').length;
  const usedPct = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 card-shadow hover:border-brand-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {ward.number}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Ward {ward.number}</p>
            <h3 className="font-semibold text-slate-900 leading-tight">{ward.name}</h3>
          </div>
        </div>
        {delayedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {delayedCount} delayed
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-400">Total Budget</p>
          <p className="font-bold text-slate-900 mt-0.5">{formatCompactCurrency(stats.totalBudget)}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-400">Used</p>
          <p className="font-bold text-emerald-700 mt-0.5">{formatCompactCurrency(stats.totalSpent)}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-400">Projects</p>
          <p className="font-bold text-slate-900 mt-0.5">{stats.projectCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-400">Avg Trust</p>
          <p className={`font-bold mt-0.5 ${stats.avgTrust >= 80 ? 'text-emerald-700' : stats.avgTrust >= 50 ? 'text-amber-700' : 'text-red-600'}`}>
            {stats.avgTrust}/100
          </p>
        </div>
      </div>

      <ProgressBar value={usedPct} showLabel={false} size="sm" className="mb-4" />
      <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        {usedPct.toFixed(0)}% budget utilized
      </p>

      <Link to={`/projects?ward=${ward.number}`} className="mt-auto">
        <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
          View Projects
        </Button>
      </Link>
    </div>
  );
}
