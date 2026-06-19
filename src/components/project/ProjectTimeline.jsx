import { Calendar, Banknote } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function ProjectTimeline({ payments = [], proofs = [] }) {
  const events = [
    ...payments.map((p, i) => ({
      id: `pay-${i}`,
      date: p.date,
      title: p.milestone,
      description: p.remarks,
      meta: formatCurrency(p.amount),
      type: 'payment',
    })),
    ...proofs.map((p, i) => ({
      id: `proof-${i}`,
      date: p.uploadedAt,
      title: p.title,
      description: `${p.type} proof uploaded`,
      meta: p.type,
      type: 'proof',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!events.length) {
    return <p className="text-sm text-slate-500">No activity recorded yet.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={event.id} className="relative pl-10">
            <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${i === 0 ? 'bg-brand-600' : event.type === 'payment' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {event.meta}
                </span>
              </div>
              {event.description && <p className="text-sm text-slate-600">{event.description}</p>}
              <p className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                {event.type === 'payment' ? <Banknote className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                {formatDate(event.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
