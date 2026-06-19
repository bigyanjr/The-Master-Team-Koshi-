import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { RiskLevelBadge } from '../ui/Badge';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
} from '../../utils/riskEngine';

export default function RiskAlerts({ projects, limit = 3 }) {
  const risky = [...projects]
    .sort((a, b) => calculateTrustScore(a, projects) - calculateTrustScore(b, projects))
    .filter((p) => getRiskFlags(p, projects).length > 0)
    .slice(0, limit);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white card-shadow overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <h2 className="text-base font-bold text-brand-950">Top {limit} Projects Needing Attention</h2>
        <p className="text-xs text-slate-500 mt-1">Open a project for full risk details.</p>
      </div>

      {risky.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No major risk flags</p>
          <p className="text-xs text-slate-500 mt-1">All tracked projects look okay for now.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {risky.map((project) => {
            const score = calculateTrustScore(project, projects);
            const flags = getRiskFlags(project, projects);
            const risk = getRiskLevel(project, projects);
            const mainReason = flags[0]?.label || 'Transparency check recommended';

            return (
              <li key={project.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-500">Ward {project.wardNo}</span>
                      <RiskLevelBadge level={risk.label} />
                      <span className="text-xs font-bold text-slate-600">Trust {score}</span>
                    </div>
                    <h3 className="font-bold text-brand-950 leading-snug">{project.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                      {mainReason}
                    </p>
                  </div>
                  <Link to={`/projects/${project.id}`} className="shrink-0">
                    <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                      View details
                    </Button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
