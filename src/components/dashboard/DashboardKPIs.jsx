import { FolderKanban, Wallet, CreditCard } from 'lucide-react';
import { formatCompactCurrency } from '../../utils/formatters';
import { getTotalPaid } from '../../utils/riskEngine';
import { useLanguage } from '../../context/LanguageContext';

const cards = [
  {
    key: 'published',
    labelKey: 'kpi.wardProjects.label',
    helper: 'Published by your ward office',
    icon: FolderKanban,
    accent: 'border-l-brand-700',
    iconBg: 'bg-brand-50 text-brand-800',
  },
  {
    key: 'budget',
    labelKey: 'kpi.totalBudget.label',
    helper: 'Money set aside for work',
    icon: Wallet,
    accent: 'border-l-blue-600',
    iconBg: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'payments',
    labelKey: 'kpi.paymentsMade.label',
    helper: 'Money released so far',
    icon: CreditCard,
    accent: 'border-l-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
];

export default function DashboardKPIs({ projects }) {
  const { t } = useLanguage();
  const totalBudget = projects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const paymentsReleased = projects.reduce((s, p) => s + getTotalPaid(p), 0);

  const values = {
    published: projects.length,
    budget: formatCompactCurrency(totalBudget),
    payments: formatCompactCurrency(paymentsReleased),
  };

  const helpers = {
    published: projects.length === 0 ? 'Nothing published yet' : `${projects.length} live record${projects.length !== 1 ? 's' : ''}`,
    budget: projects.length > 0 ? 'From ward records' : '—',
    payments: projects.length > 0 ? 'From payment posts' : '—',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ key, labelKey, helper, icon: Icon, accent, iconBg }) => (
        <div
          key={key}
          className={`rounded-2xl border border-slate-200/90 border-l-4 ${accent} bg-white p-5 sm:p-6 card-shadow min-h-[120px] flex flex-col dark:bg-slate-900 dark:border-slate-800`}
        >
          <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3 w-fit`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-snug dark:text-slate-400">{t(labelKey)}</p>
          <p className="text-2xl sm:text-3xl font-extrabold mt-1 tabular-nums text-brand-950 dark:text-red-400">
            {values[key]}
          </p>
          <p className="text-xs text-slate-500 mt-auto pt-2 dark:text-slate-500">{helpers[key] || helper}</p>
        </div>
      ))}
    </div>
  );
}
