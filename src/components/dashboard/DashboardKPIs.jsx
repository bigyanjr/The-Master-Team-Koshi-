import {
  Wallet, TrendingDown, FolderKanban, AlertTriangle,
} from 'lucide-react';
import { formatCompactCurrency, formatPercent } from '../../utils/formatters';
import { getTotalPaid, getRiskLevel } from '../../utils/riskEngine';

const cards = [
  {
    key: 'total',
    label: 'Total Budget',
    helper: 'Approved for tracked projects',
    icon: Wallet,
    accent: 'border-l-brand-700',
    iconBg: 'bg-brand-50 text-brand-800',
  },
  {
    key: 'used',
    label: 'Budget Used',
    helper: 'Payments released so far',
    icon: TrendingDown,
    accent: 'border-l-blue-600',
    iconBg: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'active',
    label: 'Active Projects',
    helper: 'Currently in progress',
    icon: FolderKanban,
    accent: 'border-l-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'highRisk',
    label: 'High Risk Projects',
    helper: 'Need closer review',
    icon: AlertTriangle,
    accent: 'border-l-red-500',
    iconBg: 'bg-red-50 text-red-600',
    warn: true,
  },
];

export default function DashboardKPIs({ projects }) {
  const totalBudget = projects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const budgetUsed = projects.reduce((s, p) => s + getTotalPaid(p), 0);
  const activeCount = projects.filter((p) => p.status === 'Ongoing').length;
  const highRiskCount = projects.filter((p) => getRiskLevel(p, projects).label === 'High Risk').length;
  const usedPct = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

  const values = {
    total: formatCompactCurrency(totalBudget),
    used: formatCompactCurrency(budgetUsed),
    active: activeCount,
    highRisk: highRiskCount,
  };

  const helpers = {
    total: `${projects.length} projects`,
    used: `${formatPercent(usedPct, 0)} of budget`,
    active: 'Ongoing ward work',
    highRisk: highRiskCount > 0 ? 'See list below' : 'All clear',
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        No projects for this ward filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, helper, icon: Icon, accent, iconBg, warn }) => {
        const isAlert = warn && values[key] > 0;
        return (
          <div
            key={key}
            className={`rounded-2xl border border-slate-200/90 border-l-4 ${accent} bg-white p-5 sm:p-6 card-shadow min-h-[140px] flex flex-col ${
              isAlert ? 'ring-1 ring-red-100' : ''
            }`}
          >
            <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3 w-fit`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl sm:text-3xl font-extrabold mt-1 tabular-nums ${
              isAlert ? 'text-red-700' : 'text-brand-950'
            }`}>
              {values[key]}
            </p>
            <p className="text-xs text-slate-500 mt-auto pt-2">{helpers[key] || helper}</p>
          </div>
        );
      })}
    </div>
  );
}
