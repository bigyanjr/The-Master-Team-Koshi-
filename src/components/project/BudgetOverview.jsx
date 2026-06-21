import { Wallet, Gavel, Banknote, PiggyBank, Percent } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

const cards = [
  { key: 'allocated', label: 'Allocated Budget', icon: Wallet, accent: 'from-brand-500/10 to-brand-600/5', iconBg: 'bg-brand-100 text-brand-700' },
  { key: 'tender', label: 'Tender Amount', icon: Gavel, accent: 'from-amber-500/10 to-amber-600/5', iconBg: 'bg-amber-100 text-amber-700' },
  { key: 'paid', label: 'Paid Amount', icon: Banknote, accent: 'from-emerald-500/10 to-emerald-600/5', iconBg: 'bg-emerald-100 text-emerald-700' },
  { key: 'remaining', label: 'Remaining', icon: PiggyBank, accent: 'from-teal-500/10 to-teal-600/5', iconBg: 'bg-teal-100 text-teal-700' },
  { key: 'used', label: 'Budget Used', icon: Percent, accent: 'from-slate-500/10 to-slate-600/5', iconBg: 'bg-slate-100 text-slate-700' },
];

export default function BudgetOverview({ project, totalPaid, budgetUsed, remaining }) {
  const values = {
    allocated: formatCompactCurrency(project.allocatedBudget),
    tender: formatCompactCurrency(project.tenderAmount),
    paid: formatCompactCurrency(totalPaid),
    remaining: formatCompactCurrency(remaining),
    used: `${budgetUsed}%`,
  };

  const fullValues = {
    allocated: formatCurrency(project.allocatedBudget),
    tender: formatCurrency(project.tenderAmount),
    paid: formatCurrency(totalPaid),
    remaining: formatCurrency(remaining),
  };

  const tenderOver = project.tenderAmount > project.allocatedBudget;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map(({ key, label, icon: Icon, accent, iconBg }) => (
        <div
          key={key}
          className={`rounded-2xl border border-slate-200/80 bg-gradient-to-br ${accent} to-white p-4 sm:p-5 card-shadow`}
          title={key !== 'used' ? fullValues[key] : undefined}
        >
          <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs sm:text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-lg sm:text-xl font-bold mt-1 ${key === 'tender' && tenderOver ? 'text-red-600' : 'text-slate-900'}`}>
            {values[key]}
          </p>
          {key === 'tender' && tenderOver && (
            <p className="text-xs text-red-600 font-medium mt-1">Exceeds allocation</p>
          )}
        </div>
      ))}
    </div>
  );
}
