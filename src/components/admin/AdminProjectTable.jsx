import { Link } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { StatusBadge, RiskLevelBadge } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { formatCurrency, getWardByNo } from '../../utils/formatters';
import { calculateTrustScore, getRiskLevel } from '../../utils/riskEngine';
import { FolderKanban } from 'lucide-react';

function MobileProjectCard({ project, ward, trust, risk }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-brand-950 leading-snug dark:text-slate-50">{project.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">Ward {ward?.number} · {project.category}</p>
        </div>
        <RiskLevelBadge level={risk.label} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <StatusBadge status={project.status} />
        <span className="font-bold text-slate-700 dark:text-red-400">Trust {trust}</span>
        <span className="text-slate-500 dark:text-slate-400">{formatCurrency(project.allocatedBudget)}</span>
      </div>
      <ProgressBar value={project.progressPercent} size="sm" />
      <div className="flex gap-2">
        <Link to={`/projects/${project.id}`} className="flex-1">
          <Button variant="secondary" size="sm" icon={Eye} className="w-full">View</Button>
        </Link>
        <Link to={`/admin/add-update?project=${project.id}`} className="flex-1">
          <Button variant="primary" size="sm" icon={Pencil} className="w-full">Update</Button>
        </Link>
      </div>
    </div>
  );
}

export default function AdminProjectTable({ projects, wards }) {
  if (!projects.length) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Add your first ward project to start publishing updates."
      />
    );
  }

  return (
    <Card padding={false}>
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <CardHeader title="Projects" subtitle="Tap a row to view or post an update" className="!mb-0" />
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden p-4 space-y-3">
        {projects.map((project) => {
          const ward = getWardByNo(wards, project.wardNo);
          const trust = calculateTrustScore(project, projects);
          const risk = getRiskLevel(project, projects);
          return (
            <MobileProjectCard
              key={project.id}
              project={project}
              ward={ward}
              trust={trust}
              risk={risk}
            />
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/80 dark:bg-slate-800/50 dark:border-slate-800">
              <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase dark:text-slate-400">Project</th>
              <th className="px-3 py-3 font-semibold text-slate-500 text-xs uppercase dark:text-slate-400">Ward</th>
              <th className="px-3 py-3 font-semibold text-slate-500 text-xs uppercase dark:text-slate-400">Budget</th>
              <th className="px-3 py-3 font-semibold text-slate-500 text-xs uppercase w-28 dark:text-slate-400">Progress</th>
              <th className="px-3 py-3 font-semibold text-slate-500 text-xs uppercase dark:text-slate-400">Status</th>
              <th className="px-3 py-3 font-semibold text-slate-500 text-xs uppercase dark:text-slate-400">Risk</th>
              <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const ward = getWardByNo(wards, project.wardNo);
              const trust = calculateTrustScore(project, projects);
              const risk = getRiskLevel(project, projects);
              const isHighRisk = trust < 50;

              return (
                <tr
                  key={project.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/40 ${
                    isHighRisk ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-brand-950 line-clamp-1 dark:text-slate-50">{project.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{project.category}</p>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-800 text-xs font-bold dark:bg-slate-800 dark:text-emerald-400">
                      W{ward?.number}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-medium text-slate-800 whitespace-nowrap dark:text-red-400">
                    {formatCurrency(project.allocatedBudget)}
                  </td>
                  <td className="px-3 py-4">
                    <ProgressBar value={project.progressPercent} showLabel={false} size="sm" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">{project.progressPercent}%</span>
                  </td>
                  <td className="px-3 py-4"><StatusBadge status={project.status} /></td>
                  <td className="px-3 py-4"><RiskLevelBadge level={risk.label} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm" icon={Eye} className="!px-2" />
                      </Link>
                      <Link to={`/admin/add-update?project=${project.id}`}>
                        <Button variant="ghost" size="sm" icon={Pencil} className="!px-2" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
