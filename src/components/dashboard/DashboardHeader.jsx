import { Building2, Search, CalendarDays } from 'lucide-react';

export default function DashboardHeader({ municipality, wardFilter, onWardChange, wards }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-brand-50/30 to-emerald-50/40 p-6 sm:p-8 card-shadow">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-700 mb-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Public Transparency Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {municipality.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              Fiscal Year {municipality.fiscalYear}
            </span>
            <span>{municipality.city}, {municipality.province}</span>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <label htmlFor="ward-filter" className="block text-xs font-medium text-slate-500 mb-1.5">
            Filter by ward
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              id="ward-filter"
              value={wardFilter}
              onChange={(e) => onWardChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 shadow-sm"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.number}>
                  Ward {w.number} — {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
