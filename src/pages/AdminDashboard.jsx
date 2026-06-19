import { useData } from '../context/DataContext';
import AdminStatCards from '../components/admin/AdminStatCards';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { projects, updates, complaints, wards } = useData();

  return (
    <div className="space-y-6">
      <AdminStatCards projects={projects} updates={updates} complaints={complaints} />

      <Card padding={false}>
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <CardHeader title="All Projects" subtitle="Manage and monitor ward projects" className="!mb-0" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                <th className="px-5 py-3 font-medium text-slate-500">Project</th>
                <th className="px-3 py-3 font-medium text-slate-500">Ward</th>
                <th className="px-3 py-3 font-medium text-slate-500">Budget</th>
                <th className="px-3 py-3 font-medium text-slate-500 w-32">Progress</th>
                <th className="px-3 py-3 font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 font-medium text-slate-500">End Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const ward = wards.find((w) => w.id === project.wardId);
                return (
                  <tr key={project.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <Link to={`/projects/${project.id}`} className="font-medium text-brand-700 hover:underline">
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-400">{project.category}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">W{ward?.number}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{formatCurrency(project.budget)}</td>
                    <td className="px-3 py-3">
                      <ProgressBar value={project.progress} showLabel={false} size="sm" />
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(project.expectedEndDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
