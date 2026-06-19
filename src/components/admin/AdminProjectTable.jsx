import { Link } from 'react-router-dom';
import { Eye, Pencil, ExternalLink } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { StatusBadge, RiskLevelBadge } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import { formatCurrency, getWardByNo } from '../../utils/formatters';
import { calculateTrustScore, getRiskLevel } from '../../utils/riskEngine';

export default function AdminProjectTable({ projects, wards }) {
  return (
    <Card padding={false}>
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <CardHeader title="Project Management" subtitle="All ward projects — verify before publishing updates" className="!mb-0" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/80">
              <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Project</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Ward</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Budget</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Contractor</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide w-28">Progress</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Trust</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Risk</th>
              <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const ward = getWardByNo(wards, project.wardNo);
              const trust = calculateTrustScore(project);
              const risk = getRiskLevel(project);

              return (
                <tr key={project.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 line-clamp-1">{project.title}</p>
                    <p className="text-xs text-slate-400">{project.category}</p>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-800 text-xs font-bold">
                      W{ward?.number}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-medium text-slate-800 whitespace-nowrap">
                    {formatCurrency(project.allocatedBudget)}
                  </td>
                  <td className="px-3 py-4 text-slate-600 text-xs max-w-[140px] truncate hidden lg:table-cell">
                    {project.contractorName || '—'}
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-24">
                      <ProgressBar value={project.progressPercent} showLabel={false} size="sm" />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{project.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-4"><StatusBadge status={project.status} /></td>
                  <td className="px-3 py-4">
                    <span className={`font-bold ${trust >= 80 ? 'text-emerald-700' : trust >= 50 ? 'text-amber-700' : 'text-red-600'}`}>
                      {trust}
                    </span>
                  </td>
                  <td className="px-3 py-4"><RiskLevelBadge level={risk.label} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/projects/${project.id}`} title="View public page">
                        <Button variant="ghost" size="sm" icon={Eye} className="!px-2" />
                      </Link>
                      <Link to={`/admin/add-update?project=${project.id}`} title="Post update">
                        <Button variant="ghost" size="sm" icon={Pencil} className="!px-2" />
                      </Link>
                      <Link to={`/projects/${project.id}`} target="_blank" title="Open in new tab">
                        <Button variant="ghost" size="sm" icon={ExternalLink} className="!px-2" />
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
