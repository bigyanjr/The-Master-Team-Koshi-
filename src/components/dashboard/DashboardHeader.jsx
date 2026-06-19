import { Building2, Filter } from 'lucide-react';

export default function DashboardHeader({ municipality, wardFilter, onWardChange, wards }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 card-shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Building2 className="h-3.5 w-3.5" />
            Public money tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight leading-tight">
            Itahari Public Transparency Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Track ward projects, public budget, contractor payments, proofs, and citizen complaints in one place.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {municipality.name} · FY {municipality.fiscalYear}
          </p>
        </div>

        <div className="w-full lg:w-52 shrink-0">
          <label htmlFor="ward-filter" className="block text-xs font-semibold text-slate-500 mb-2">
            Filter by ward
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              id="ward-filter"
              value={wardFilter}
              onChange={(e) => onWardChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 focus:bg-white"
            >
              <option value="all">All wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.number}>
                  Ward {w.number}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
