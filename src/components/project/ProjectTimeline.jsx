import { Calendar, User } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function ProjectTimeline({ updates }) {
  const sorted = [...updates].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!sorted.length) {
    return <p className="text-sm text-slate-500">No updates posted yet.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-4">
        {sorted.map((update, i) => (
          <div key={update.id} className="relative pl-10">
            <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${i === 0 ? 'bg-brand-600' : 'bg-slate-300'}`} />
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-900">{update.title}</h4>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {update.progressAfter}% complete
                </span>
              </div>
              <p className="text-sm text-slate-600">{update.description}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(update.date)}
                </span>
                {update.postedBy && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {update.postedBy}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
