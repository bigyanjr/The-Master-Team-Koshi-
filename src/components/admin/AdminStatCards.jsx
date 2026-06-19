import { Link } from 'react-router-dom';
import { PlusCircle, FileText, FolderKanban, AlertCircle } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import StatCard from '../ui/StatCard';
import { RiskLevelBadge } from '../ui/Badge';
import { calculateTrustScore, getRiskLevel, getAllComplaints } from '../../utils/riskEngine';

export default function AdminStatCards({ projects }) {
  const inProgress = projects.filter((p) => p.status === 'Ongoing').length;
  const pending = projects.filter((p) => p.status === 'Planned' || p.status === 'Tender Open').length;
  const complaints = getAllComplaints(projects);
  const openComplaints = complaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review' || c.status === 'Verified'
  ).length;
  const highRisk = projects.filter((p) => getRiskLevel(p).label === 'High Risk').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} color="brand" />
        <StatCard label="Ongoing" value={inProgress} icon={PlusCircle} color="emerald" />
        <StatCard label="Planned / Tender" value={pending} subtext="Not yet started" color="amber" />
        <StatCard label="Open Complaints" value={openComplaints} icon={AlertCircle} color={openComplaints ? 'red' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Quick Actions" subtitle="Common admin tasks" />
          <div className="flex flex-col gap-2">
            <Link to="/admin/add-project">
              <Button variant="primary" icon={PlusCircle} className="w-full">Add New Project</Button>
            </Link>
            <Link to="/admin/add-update">
              <Button variant="secondary" icon={FileText} className="w-full">Post Progress Update</Button>
            </Link>
          </div>
        </Card>
        <Card>
          <CardHeader title="Risk Overview" subtitle={`${highRisk} high-risk projects`} />
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {projects.map((p) => {
              const risk = getRiskLevel(p);
              return (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm">
                  <span className="truncate flex-1 mr-2 text-slate-700">{p.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500">{calculateTrustScore(p)}</span>
                    <RiskLevelBadge level={risk.label} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
