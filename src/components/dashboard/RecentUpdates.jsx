import { Link } from 'react-router-dom';
import { Banknote, Camera, ArrowRight } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { formatCompactCurrency, formatDate } from '../../utils/formatters';
import { getRecentActivity } from '../../utils/riskEngine';

const typeConfig = {
  payment: { icon: Banknote, label: 'Payment', color: 'bg-emerald-100 text-emerald-700' },
  proof: { icon: Camera, label: 'Proof', color: 'bg-blue-100 text-blue-700' },
};

export default function RecentUpdates({ projects, limit = 8 }) {
  const events = getRecentActivity(projects, limit);

  return (
    <Card padding={false}>
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <CardHeader
          title="Recent Project Updates"
          subtitle="Latest payments and proof uploads across all wards"
          className="!mb-0"
        />
        <Link to="/projects" className="shrink-0 hidden sm:block">
          <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">All Projects</Button>
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {events.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">No recent activity recorded.</p>
        ) : (
          events.map((event) => {
            const config = typeConfig[event.type] || typeConfig.payment;
            const Icon = config.icon;
            const detail = event.type === 'payment'
              ? formatCompactCurrency(Number(event.detail))
              : event.detail;

            return (
              <Link
                key={event.id}
                to={`/projects/${event.projectId}`}
                className="flex items-start gap-4 p-4 sm:px-6 hover:bg-slate-50/80 transition-colors group"
              >
                <div className={`p-2 rounded-xl shrink-0 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-700">
                      {event.title}
                    </p>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{event.subtitle}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(event.date)} · {detail}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
