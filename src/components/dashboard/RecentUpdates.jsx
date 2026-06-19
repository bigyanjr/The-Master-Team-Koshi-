import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Camera, MessageSquare, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { formatDate } from '../../utils/formatters';
import { getRecentActivity } from '../../utils/riskEngine';

const typeConfig = {
  payment: { icon: Banknote, label: 'Payment', color: 'bg-emerald-100 text-emerald-700' },
  proof: { icon: Camera, label: 'Proof', color: 'bg-blue-100 text-blue-700' },
  complaint: { icon: MessageSquare, label: 'Complaint', color: 'bg-amber-100 text-amber-700' },
};

function buildRecentEvents(projects, limit) {
  const paymentProof = getRecentActivity(projects, limit * 2);

  const complaints = projects.flatMap((p) =>
    (p.complaints ?? []).map((c, i) => ({
      id: `comp-${p.id}-${i}`,
      type: 'complaint',
      date: c.createdAt,
      title: c.category || 'Citizen feedback',
      subtitle: p.title,
      projectId: p.id,
    })),
  );

  return [...paymentProof, ...complaints]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export default function RecentUpdates({ projects, limit = 3 }) {
  const events = useMemo(() => buildRecentEvents(projects, limit), [projects, limit]);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white card-shadow overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-brand-950">Latest Updates</h2>
          <p className="text-xs text-slate-500 mt-0.5">Most recent public records</p>
        </div>
        <Link to="/projects">
          <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
            View all projects
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No updates yet"
          description="New payments, proofs, and feedback will show here."
          compact
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {events.map((event) => {
            const config = typeConfig[event.type] || typeConfig.payment;
            const Icon = config.icon;

            return (
              <li key={event.id}>
                <Link
                  to={`/projects/${event.projectId}`}
                  className="flex items-center gap-3 p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-950 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500 truncate">{event.subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${config.color}`}>
                      {config.label}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{formatDate(event.date)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
