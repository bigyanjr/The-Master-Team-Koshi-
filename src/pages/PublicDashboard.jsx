import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import {
  BudgetByCategoryPieChart,
  BudgetUsedRemainingBarChart,
  ProjectsByStatusChart,
} from '../components/dashboard/DashboardCharts';
import WardSummaryCard from '../components/dashboard/WardSummaryCard';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import RiskAlerts from '../components/dashboard/RiskAlerts';

export default function PublicDashboard() {
  const { municipality, wards, projects } = useData();
  const [wardFilter, setWardFilter] = useState('all');

  const filteredProjects = useMemo(() => {
    if (wardFilter === 'all') return projects;
    return projects.filter((p) => p.wardNo === Number(wardFilter));
  }, [projects, wardFilter]);

  const filteredWards = useMemo(() => {
    if (wardFilter === 'all') return wards;
    return wards.filter((w) => w.number === Number(wardFilter));
  }, [wards, wardFilter]);

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DashboardHeader
          municipality={municipality}
          wards={wards}
          wardFilter={wardFilter}
          onWardChange={setWardFilter}
        />

        <DashboardKPIs projects={filteredProjects} />

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Budget Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BudgetByCategoryPieChart projects={filteredProjects} />
            <BudgetUsedRemainingBarChart projects={filteredProjects} />
            <ProjectsByStatusChart projects={filteredProjects} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Ward Summary</h2>
            {wardFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setWardFilter('all')}
                className="text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                Show all wards
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {filteredWards.map((ward) => (
              <WardSummaryCard key={ward.id} ward={ward} projects={filteredProjects} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3">
            <RecentUpdates projects={filteredProjects} />
          </div>
          <div className="xl:col-span-2">
            <RiskAlerts projects={filteredProjects} />
          </div>
        </div>
      </div>
    </div>
  );
}
