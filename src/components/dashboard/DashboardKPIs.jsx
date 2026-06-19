import {
  Wallet, TrendingDown, PiggyBank, FolderKanban, Clock, AlertTriangle,
} from 'lucide-react';
import { formatCompactCurrency, formatPercent } from '../../utils/formatters';
import { getTotalPaid, calculateTrustScore } from '../../utils/riskEngine';

const kpiConfig = [
  { key: 'total', label: 'Total Budget', icon: Wallet, color: 'brand', accent: 'from-brand-500/10 to-brand-600/5' },
  { key: 'used', label: 'Budget Used', icon: TrendingDown, color: 'emerald', accent: 'from-emerald-500/10 to-emerald-600/5' },
  { key: 'remaining', label: 'Remaining Budget', icon: PiggyBank, color: 'brand', accent: 'from-teal-500/10 to-teal-600/5' },
  { key: 'active', label: 'Active Projects', icon: FolderKanban, color: 'emerald', accent: 'from-blue-500/10 to-blue-600/5' },
  { key: 'delayed', label: 'Delayed Projects', icon: Clock, color: 'amber', accent: 'from-amber-500/10 to-amber-600/5' },
  { key: 'highRisk', label: 'High Risk Projects', icon: AlertTriangle, color: 'red', accent: 'from-red-500/10 to-red-600/5' },
];

const iconStyles = {
  brand: 'bg-brand-100 text-brand-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export default function DashboardKPIs({ projects }) {
  const totalBudget = projects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const budgetUsed = projects.reduce((s, p) => s + getTotalPaid(p), 0);
  const remaining = Math.max(0, totalBudget - budgetUsed);
  const activeCount = projects.filter((p) => p.status === 'Ongoing').length;
  const delayedCount = projects.filter((p) => p.status === 'Delayed').length;
  const highRiskCount = projects.filter((p) => calculateTrustScore(p) < 50).length;
  const usedPct = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

  const values = {
    total: formatCompactCurrency(totalBudget),
    used: formatCompactCurrency(budgetUsed),
    remaining: formatCompactCurrency(remaining),
    active: activeCount,
    delayed: delayedCount,
    highRisk: highRiskCount,
  };

  const subtexts = {
    total: `Across ${projects.length} projects`,
    used: `${formatPercent(usedPct, 1)} of total budget`,
    remaining: `${formatPercent(100 - usedPct, 1)} unspent`,
    active: 'Currently in progress',
    delayed: 'Past deadline or flagged',
    highRisk: 'Trust score below 50',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {kpiConfig.map(({ key, label, icon: Icon, color, accent }) => (
        <div
          key={key}
          className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${accent} to-white p-5 card-shadow hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{values[key]}</p>
              <p className="text-xs text-slate-400 mt-1">{subtexts[key]}</p>
            </div>
            <div className={`p-2.5 rounded-xl shrink-0 ${iconStyles[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
