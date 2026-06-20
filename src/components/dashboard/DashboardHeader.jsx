import { MapPin } from 'lucide-react';
import WardSelect from '../form/WardSelect';
import { PRODUCT_NAME, MUNICIPALITY_NAME } from '../../config/branding';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardHeader({ wardFilter, onWardChange }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 sm:p-8 card-shadow dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide dark:text-emerald-400">{PRODUCT_NAME}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mt-2 leading-tight dark:text-slate-50">
          {MUNICIPALITY_NAME} — {t('dashboard.heading.suffix')}
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-2xl leading-relaxed dark:text-slate-400">
          See ward projects, payments, and proof photos published by your local ward office.
          No login needed to browse.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 card-shadow dark:bg-slate-900 dark:border-slate-800">
        <label htmlFor="ward-filter" className="flex items-center gap-2 text-base font-bold text-brand-950 mb-3 dark:text-slate-50">
          <MapPin className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
          {t('dashboard.chooseWard')}
        </label>
        <WardSelect
          id="ward-filter"
          value={wardFilter}
          onChange={(e) => onWardChange(e.target.value)}
          includeAllOption
          allOptionLabel={t('ward.all')}
          includeEmptyOption={false}
          selectClassName="w-full sm:max-w-sm px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-base font-semibold text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
        />
      </div>
    </div>
  );
}
