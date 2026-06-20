import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { aggregateWardStats } from '../../utils/riskEngine';
import { formatWardLabel } from '../../constants/wards';

function trustStyles(score) {
  if (score >= 80) return { ring: 'ring-emerald-200', badge: 'bg-emerald-100 text-emerald-800', label: 'Good trust' };
  if (score >= 50) return { ring: 'ring-amber-200', badge: 'bg-amber-100 text-amber-800', label: 'Fair trust' };
  return { ring: 'ring-red-200', badge: 'bg-red-100 text-red-800', label: 'Low trust' };
}

export default function WardSummaryCard({ ward, projects }) {
  const stats = aggregateWardStats(ward.number, projects);
  const usedPct = stats.totalBudget > 0
    ? Math.round((stats.totalSpent / stats.totalBudget) * 100)
    : 0;
  const trust = trustStyles(stats.avgTrust);

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 card-shadow flex flex-col min-h-[220px] ring-2 ${trust.ring}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-brand-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {ward.number}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-950 text-sm leading-snug">
            {formatWardLabel(ward.number)}
          </h3>
        </div>
      </div>

      <dl className="space-y-2.5 text-sm flex-1">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Projects</dt>
          <dd className="font-bold text-brand-950">{stats.projectCount}</dd>
        </div>
        <div>
          <div className="flex justify-between gap-2 mb-1">
            <dt className="text-slate-500">Budget used</dt>
            <dd className="font-bold text-brand-950">{usedPct}%</dd>
          </div>
          <ProgressBar value={usedPct} showLabel={false} size="sm" />
        </div>
        <div className="flex justify-between items-center gap-2 pt-1">
          <dt className="text-slate-500">Avg trust</dt>
          <dd>
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${trust.badge}`}>
              {stats.avgTrust}/100
            </span>
          </dd>
        </div>
      </dl>

      <Link to={`/projects?ward=${ward.number}`} className="mt-4">
        <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
          View Projects
        </Button>
      </Link>
    </div>
  );
}
