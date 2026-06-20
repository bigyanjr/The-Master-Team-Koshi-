import {
  FolderKanban, Wallet, CreditCard, ShieldAlert,
} from 'lucide-react';
import { formatCompactCurrency } from '../../utils/formatters';
import { getTotalPaid, getRiskFlags, hasEnoughRiskData } from '../../utils/riskEngine';

const cards = [
  {
    key: 'published',
    label: 'Published Projects',
    helper: 'Official ward records live on the portal',
    icon: FolderKanban,
    accent: 'border-l-brand-700',
    iconBg: 'bg-brand-50 text-brand-800',
  },
  {
    key: 'budget',
    label: 'Total Budget Published',
    helper: 'Sum of published project allocations',
    icon: Wallet,
    accent: 'border-l-blue-600',
    iconBg: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'payments',
    label: 'Payment Released',
    helper: 'Total payments posted by ward admins',
    icon: CreditCard,
    accent: 'border-l-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'verification',
    label: 'Projects Needing Verification',
    helper: 'Flags that need ward admin review',
    icon: ShieldAlert,
    accent: 'border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-700',
    warn: true,
  },
];

export default function DashboardKPIs({ projects }) {
  const totalBudget = projects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const paymentsReleased = projects.reduce((s, p) => s + getTotalPaid(p), 0);
  const needsVerification = projects.filter(
    (p) => hasEnoughRiskData(p) && getRiskFlags(p, projects).length > 0,
  ).length;

  const values = {
    published: projects.length,
    budget: formatCompactCurrency(totalBudget),
    payments: formatCompactCurrency(paymentsReleased),
    verification: needsVerification,
  };

  const helpers = {
    published: projects.length === 1 ? '1 live project' : `${projects.length} live projects`,
    budget: projects.length > 0 ? 'From published records' : 'No budget published yet',
    payments: projects.length > 0 ? 'From payment updates' : 'No payments yet',
    verification: needsVerification > 0 ? 'Review recommended' : projects.length > 0 ? 'All clear' : 'No data yet',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, helper, icon: Icon, accent, iconBg, warn }) => {
        const isAlert = warn && values[key] > 0;
        return (
          <div
            key={key}
            className={`rounded-2xl border border-slate-200/90 border-l-4 ${accent} bg-white p-5 sm:p-6 card-shadow min-h-[130px] flex flex-col ${
              isAlert ? 'ring-1 ring-amber-100' : ''
            }`}
          >
            <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3 w-fit`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-snug">{label}</p>
            <p className={`text-2xl sm:text-3xl font-extrabold mt-1 tabular-nums ${
              isAlert ? 'text-amber-700' : 'text-brand-950'
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
