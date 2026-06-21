import { Wallet, TrendingDown, PiggyBank, FolderKanban } from 'lucide-react';
import StatCard from '../ui/StatCard';
import ProgressBar from '../ui/ProgressBar';
import { formatCompactCurrency } from '../../utils/formatters';
import { formatWardLabel } from '../../constants/wards';
import { useLanguage } from '../../context/LanguageContext';

export default function WardBudgetSummary({ wardNo, summary }) {
  const {
    isPublished, totalAllocatedBudget, wardExpenditure, remainingBudget, projectCount, spentPercentage,
  } = summary;
  const { t } = useLanguage();

  const wardLabel = formatWardLabel(wardNo);

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('wardBudget.card.budget.label')}
          value={isPublished ? formatCompactCurrency(totalAllocatedBudget) : t('wardBudget.notPublished')}
          subtext={isPublished ? `${t('wardBudget.card.budget.sub')} ${wardLabel}` : null}
          icon={Wallet}
          color="brand"
        />
        <StatCard
          label={t('wardBudget.card.expenditure.label')}
          value={isPublished ? formatCompactCurrency(wardExpenditure) : '—'}
          subtext={isPublished ? t('wardBudget.card.expenditure.sub') : null}
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          label={t('wardBudget.card.remaining.label')}
          value={isPublished ? formatCompactCurrency(remainingBudget) : '—'}
          subtext={isPublished ? t('wardBudget.card.remaining.sub') : null}
          icon={PiggyBank}
          color="emerald"
        />
        <StatCard
          label={t('wardBudget.card.projects.label')}
          value={projectCount}
          subtext={t('wardBudget.card.projects.sub')}
          icon={FolderKanban}
          color="brand"
        />
      </div>

      {isPublished && totalAllocatedBudget > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 card-shadow dark:bg-slate-900 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 mb-2 dark:text-slate-300">
            {t('wardBudget.spentLabel')} {spentPercentage}% {t('wardBudget.ofBudget')}
          </p>
          <ProgressBar value={spentPercentage} showLabel={false} size="md" />
        </div>
      )}
    </section>
  );
}
