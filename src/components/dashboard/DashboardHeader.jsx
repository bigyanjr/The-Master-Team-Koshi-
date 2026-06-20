import { Info, MapPin } from 'lucide-react';
import WardSelect from '../form/WardSelect';
import { PRODUCT_NAME, TAGLINE } from '../../config/branding';

export default function DashboardHeader({ wardFilter, onWardChange }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 sm:p-8 card-shadow">
        <div className="flex gap-4">
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white">
            <Info className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{PRODUCT_NAME}</p>
            <p className="text-xs text-slate-500 mt-0.5">{TAGLINE}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mt-2 leading-tight">
              Itahari Public Transparency Dashboard
            </h1>
            <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
              This dashboard shows only records published by ward admins. If no data appears,
              no ward project has been published yet.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 card-shadow">
        <label htmlFor="ward-filter" className="flex items-center gap-2 text-sm font-bold text-brand-950 mb-3">
          <MapPin className="h-4 w-4 text-brand-700" />
          Select Ward
        </label>
        <WardSelect
          id="ward-filter"
          value={wardFilter}
          onChange={(e) => onWardChange(e.target.value)}
          includeAllOption
          allOptionLabel="All Wards"
          includeEmptyOption={false}
          selectClassName="w-full sm:max-w-xs px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-base font-semibold text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500"
        />
      </div>
    </div>
  );
}
