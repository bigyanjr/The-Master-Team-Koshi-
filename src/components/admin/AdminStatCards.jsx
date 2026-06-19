import { Link } from 'react-router-dom';
import { PlusCircle, FileText, FolderKanban, AlertCircle } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import StatCard from '../ui/StatCard';

export default function AdminStatCards({ projects, updates, complaints }) {
  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const pending = projects.filter((p) => p.status === 'pending').length;
  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'investigating').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} color="brand" />
        <StatCard label="In Progress" value={inProgress} icon={PlusCircle} color="emerald" />
        <StatCard label="Pending Start" value={pending} subtext="Awaiting contractor" color="amber" />
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
          <CardHeader title="Recent Updates" subtitle={`${updates.length} total posted`} />
          <div className="space-y-2">
            {updates.slice(0, 4).map((u) => (
              <div key={u.id} className="text-sm p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-800">{u.title}</span>
                <span className="text-slate-400 ml-2 text-xs">{u.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
