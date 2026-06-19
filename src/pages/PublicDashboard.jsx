import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import OverviewStats from '../components/dashboard/OverviewStats';
import {
  BudgetOverviewChart,
  SpendingByWardChart,
  ProjectStatusChart,
  RecentActivity,
  TrustScoreChart,
} from '../components/dashboard/Charts';
import ProjectCard from '../components/project/ProjectCard';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCompactCurrency } from '../utils/formatters';
import { aggregateWardStats } from '../utils/riskEngine';

export default function PublicDashboard() {
  const { municipality, wards, projects } = useData();

  const featured = projects.filter((p) => p.status === 'Ongoing').slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Public Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {municipality.name} · FY {municipality.fiscalYear} · {municipality.city}, {municipality.province}
        </p>
      </div>

      <OverviewStats municipality={municipality} projects={projects} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetOverviewChart projects={projects} />
        <SpendingByWardChart wards={wards} projects={projects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <CardHeader
                title="Ward Overview"
                subtitle="Budget utilization and trust scores by ward"
                action={
                  <Link to="/projects">
                    <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">All Projects</Button>
                  </Link>
                }
                className="!mb-0"
              />
            </div>
            <div className="divide-y divide-slate-100">
              {wards.map((ward) => {
                const stats = aggregateWardStats(ward.number, projects);
                const utilization = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;
                return (
                  <div key={ward.id} className="flex items-center gap-4 p-4 sm:p-5 hover:bg-slate-50/50">
                    <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                      W{ward.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{ward.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {stats.projectCount} projects · {stats.avgProgress}% avg progress · trust {stats.avgTrust}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-800">{formatCompactCurrency(stats.totalSpent)}</p>
                      <p className="text-xs text-slate-400">{utilization.toFixed(0)}% of {formatCompactCurrency(stats.totalBudget)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <ProjectStatusChart projects={projects} />
      </div>

      <TrustScoreChart projects={projects} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} wards={wards} />
            ))}
          </div>
        </div>
        <RecentActivity projects={projects} />
      </div>
    </div>
  );
}
