import { Link } from 'react-router-dom';
import {
  PlusCircle, Banknote, Camera, MessageSquareWarning, Activity,
} from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

const TYPE_CONFIG = {
  project: { icon: PlusCircle, color: 'bg-brand-100 text-brand-700' },
  payment: { icon: Banknote, color: 'bg-emerald-100 text-emerald-700' },
  proof: { icon: Camera, color: 'bg-blue-100 text-blue-700' },
  complaint: { icon: MessageSquareWarning, color: 'bg-amber-100 text-amber-700' },
};

export default function AdminActivityFeed({ activities, limit = 8 }) {
  const recent = activities.slice(0, limit);

  return (
    <Card padding={false}>
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <CardHeader title="Recent Admin Activity" subtitle="Transparency updates posted by ward IT" className="!mb-0" />
      </div>
      {recent.length === 0 ? (
        <p className="p-6 text-sm text-slate-500 text-center">No admin activity recorded yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {recent.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.proof;
            const Icon = config.icon;
            return (
              <div key={item.id} className="flex items-start gap-3 p-4 sm:px-6 hover:bg-slate-50/50 transition-colors">
                <div className={`p-2 rounded-xl shrink-0 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.detail}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(item.date)} · {formatRelativeTime(item.date)}
                  </p>
                </div>
                {item.projectId && (
                  <Link
                    to={`/projects/${item.projectId}`}
                    className="text-xs font-medium text-brand-700 hover:text-brand-800 shrink-0"
                  >
                    View
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function DataResponsibilityNotice() {
  return (
    <div className="flex gap-4 p-5 sm:p-6 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50">
      <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 h-fit">
        <Activity className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-amber-900">Data Responsibility Notice</h3>
        <p className="text-sm text-amber-800/90 mt-1.5 leading-relaxed">
          Every update posted by ward IT teams becomes visible to citizens. Please verify budget, tender, payment, and proof details before publishing.
        </p>
        <p className="text-xs text-amber-700/70 mt-2">
          Demo mode — no authentication. In production, all actions are logged with official ID and timestamp.
        </p>
      </div>
    </div>
  );
}
