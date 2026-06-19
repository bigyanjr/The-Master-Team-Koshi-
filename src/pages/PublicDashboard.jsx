import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import CitizenActions from '../components/dashboard/CitizenActions';
import WardSummaryCard from '../components/dashboard/WardSummaryCard';
import RiskAlerts from '../components/dashboard/RiskAlerts';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import DashboardFooterNote from '../components/dashboard/DashboardFooterNote';

export default function PublicDashboard() {
  const { municipality, wards, projects, dataLoading } = useData();
  const [wardFilter, setWardFilter] = useState('all');

  const filteredProjects = useMemo(() => {
    if (wardFilter === 'all') return projects;
    return projects.filter((p) => p.wardNo === Number(wardFilter));
  }, [projects, wardFilter]);

  const filteredWards = useMemo(() => {
    if (wardFilter === 'all') return wards;
    return wards.filter((w) => w.number === Number(wardFilter));
  }, [wards, wardFilter]);

  if (dataLoading) {
    return (
      <div className="min-h-[60vh] dashboard-bg flex items-center justify-center">
        <LoadingSpinner label="Loading public data…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg pb-10">
      <div className="page-container py-8 sm:py-10 space-y-10 sm:space-y-12">
        {/* Section 1: Hero + ward filter */}
        <DashboardHeader
          municipality={municipality}
          wards={wards}
          wardFilter={wardFilter}
          onWardChange={setWardFilter}
        />

        {/* Section 2: KPI summary */}
        <section>
          <h2 className="sr-only">Summary</h2>
          <DashboardKPIs projects={filteredProjects} />
        </section>

        {/* Section 3: Citizen actions */}
        <CitizenActions />

        {/* Section 4: Ward overview */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-brand-950">Ward Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tap a ward to see its projects</p>
            </div>
            {wardFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setWardFilter('all')}
                className="text-sm font-medium text-brand-700 hover:text-brand-900"
              >
                Show all wards
              </button>
            )}
          </div>
          {filteredWards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No wards match this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {filteredWards.map((ward) => (
                <WardSummaryCard key={ward.id} ward={ward} projects={filteredProjects} />
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Top risk projects */}
        <RiskAlerts projects={filteredProjects} limit={3} />

        {/* Section 6: Latest updates */}
        <RecentUpdates projects={filteredProjects} limit={3} />

        {/* Section 7: Demo footer note */}
        <DashboardFooterNote municipality={municipality} />
      </div>
    </div>
  );
}
