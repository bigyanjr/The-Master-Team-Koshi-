import { useData } from '../context/DataContext';
import AdminStatCards from '../components/admin/AdminStatCards';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge, RiskLevelBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { formatCurrency, formatDate, getWardByNo } from '../utils/formatters';
import { Link } from 'react-router-dom';
import {
  calculateTrustScore,
  getRiskLevel,
  getBudgetUsedPercent,
  getRiskFlags,
} from '../utils/riskEngine';

export default function AdminDashboard() {
  const { projects, wards } = useData();

  return (
    <div className="space-y-6">
      <AdminStatCards projects={projects} />

      <Card padding={false}>
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <CardHeader title="All Projects" subtitle="Trust scores and risk levels from risk engine" className="!mb-0" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                <th className="px-5 py-3 font-medium text-slate-500">Project</th>
                <th className="px-3 py-3 font-medium text-slate-500">Ward</th>
                <th className="px-3 py-3 font-medium text-slate-500">Budget</th>
                <th className="px-3 py-3 font-medium text-slate-500">Used</th>
                <th className="px-3 py-3 font-medium text-slate-500 w-28">Progress</th>
                <th className="px-3 py-3 font-medium text-slate-500">Trust</th>
                <th className="px-3 py-3 font-medium text-slate-500">Risk</th>
                <th className="px-3 py-3 font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 font-medium text-slate-500">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const ward = getWardByNo(wards, project.wardNo);
                const trust = calculateTrustScore(project);
                const risk = getRiskLevel(project);
                const flagCount = getRiskFlags(project).length;
                return (
                  <tr key={project.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <Link to={`/projects/${project.id}`} className="font-medium text-brand-700 hover:underline">
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-400">{project.category}{flagCount > 0 ? ` · ${flagCount} flags` : ''}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">W{ward?.number}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{formatCurrency(project.allocatedBudget)}</td>
                    <td className="px-3 py-3 text-slate-600">{getBudgetUsedPercent(project)}%</td>
                    <td className="px-3 py-3">
                      <ProgressBar value={project.progressPercent} showLabel={false} size="sm" />
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-800">{trust}</td>
                    <td className="px-3 py-3"><RiskLevelBadge level={risk.label} /></td>
                    <td className="px-3 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(project.deadline)}</td>
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
