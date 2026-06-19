import { FolderKanban, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { formatCompactCurrency, formatPercent } from '../../utils/formatters';
import { calculateTrustScore } from '../../utils/riskEngine';

export default function OverviewStats({ municipality, projects, payments, complaints }) {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = payments.reduce((s, p) => s + p.amount, 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.progress ?? 0), 0) / projects.length)
    : 0;

  const context = { payments, proofs: [], updates: [], complaints, contractors: [] };
  const avgTrust = projects.length
    ? Math.round(
        projects.reduce((s, p) => s + calculateTrustScore(p, context), 0) / projects.length
      )
    : 0;

  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'investigating').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Projects"
        value={projects.filter((p) => p.status === 'in-progress').length}
        subtext={`${projects.length} total across ${municipality.wards} wards`}
        icon={FolderKanban}
        color="brand"
      />
      <StatCard
        label="Total Budget"
        value={formatCompactCurrency(totalBudget)}
        subtext={`${formatPercent((totalSpent / totalBudget) * 100, 1)} utilized`}
        icon={IndianRupee}
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
        label="Open Issues"
        value={openComplaints}
        subtext={`Avg trust score: ${avgTrust}/100`}
        icon={AlertTriangle}
        color={openComplaints > 0 ? 'amber' : 'emerald'}
      />
    </div>
  );
}
