import { FolderKanban, Banknote, TrendingUp, Shield } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { formatCompactCurrency, formatPercent } from '../../utils/formatters';
import {
  calculateTrustScore,
  getTotalPaid,
  getAllComplaints,
} from '../../utils/riskEngine';

export default function OverviewStats({ municipality, projects }) {
  const totalBudget = projects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const totalSpent = projects.reduce((s, p) => s + getTotalPaid(p), 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.progressPercent ?? 0), 0) / projects.length)
    : 0;

  const avgTrust = projects.length
    ? Math.round(projects.reduce((s, p) => s + calculateTrustScore(p), 0) / projects.length)
    : 0;

  const allComplaints = getAllComplaints(projects);
  const openComplaints = allComplaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review' || c.status === 'Verified'
  ).length;

  const highRiskCount = projects.filter((p) => calculateTrustScore(p) < 50).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Projects"
        value={projects.filter((p) => p.status === 'Ongoing').length}
        subtext={`${projects.length} total across ${municipality.wards} wards`}
        icon={FolderKanban}
        color="brand"
      />
      <StatCard
        label="Total Budget"
        value={formatCompactCurrency(totalBudget)}
        subtext={`${formatPercent(totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0, 1)} utilized`}
        icon={Banknote}
        color="emerald"
      />
      <StatCard
        label="Avg. Progress"
        value={`${avgProgress}%`}
        subtext={`FY ${municipality.fiscalYear}`}
        icon={TrendingUp}
        color="brand"
      />
      <StatCard
        label="Avg Trust Score"
        value={`${avgTrust}/100`}
        subtext={`${openComplaints} open complaints · ${highRiskCount} high risk`}
        icon={Shield}
        color={avgTrust >= 80 ? 'emerald' : avgTrust >= 50 ? 'amber' : 'red'}
      />
    </div>
  );
}
