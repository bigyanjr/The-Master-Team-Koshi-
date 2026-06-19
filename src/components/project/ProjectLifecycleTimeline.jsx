import {
  Wallet, Gavel, HardHat, PlayCircle, Banknote, Camera, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate, formatCompactCurrency } from '../../utils/formatters';

function daysBefore(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const ICON_MAP = {
  budget: { icon: Wallet, color: 'bg-brand-100 text-brand-700 ring-brand-200' },
  tender: { icon: Gavel, color: 'bg-amber-100 text-amber-700 ring-amber-200' },
  contractor: { icon: HardHat, color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  start: { icon: PlayCircle, color: 'bg-blue-100 text-blue-700 ring-blue-200' },
  payment: { icon: Banknote, color: 'bg-teal-100 text-teal-700 ring-teal-200' },
  proof: { icon: Camera, color: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  complete: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  delay: { icon: AlertTriangle, color: 'bg-red-100 text-red-700 ring-red-200' },
};

export function buildLifecycleEvents(project) {
  const events = [];

  if (project.allocatedBudget) {
    events.push({
      id: 'budget',
      type: 'budget',
      date: daysBefore(project.startDate, 45),
      title: 'Budget Allocated',
      description: `${formatCompactCurrency(project.allocatedBudget)} approved for Ward ${project.wardNo}`,
    });
  }

  if (project.tenderAmount) {
    events.push({
      id: 'tender',
      type: 'tender',
      date: daysBefore(project.startDate, 21),
      title: 'Tender Opened',
      description: `Estimated value ${formatCompactCurrency(project.tenderAmount)} — procurement published publicly`,
    });
  }

  if (project.contractorName) {
    events.push({
      id: 'contractor',
      type: 'contractor',
      date: daysBefore(project.startDate, 7),
      title: 'Contractor Selected',
      description: project.contractorName,
    });
  }

  events.push({
    id: 'start',
    type: 'start',
    date: project.startDate,
    title: 'Work Started',
    description: project.location,
  });

  (project.payments ?? []).forEach((p, i) => {
    events.push({
      id: `payment-${i}`,
      type: 'payment',
      date: p.date,
      title: 'Payment Released',
      description: `${formatCompactCurrency(p.amount)} — ${p.milestone}`,
    });
  });

  (project.proofs ?? []).forEach((p, i) => {
    events.push({
      id: `proof-${i}`,
      type: 'proof',
      date: p.uploadedAt,
      title: 'Proof Uploaded',
      description: `${p.title} (${p.type})`,
    });
  });

  if (project.status === 'Completed') {
    const lastDate = [...(project.proofs ?? []).map((p) => p.uploadedAt), project.deadline]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];
    events.push({
      id: 'complete',
      type: 'complete',
      date: lastDate || project.deadline,
      title: 'Project Completed',
      description: `${project.progressPercent}% progress — handover recorded`,
    });
  } else if (project.status === 'Delayed') {
    events.push({
      id: 'delay',
      type: 'delay',
      date: project.deadline,
      title: 'Delay Flagged',
      description: `Past deadline (${formatDate(project.deadline)}) with ${project.progressPercent}% complete`,
    });
  }

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function ProjectLifecycleTimeline({ project }) {
  const events = buildLifecycleEvents(project);

  return (
    <div className="relative">
      <div className="absolute left-[1.125rem] sm:left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-200 via-emerald-200 to-slate-200" />
      <div className="space-y-0">
        {events.map((event, i) => {
          const config = ICON_MAP[event.type] || ICON_MAP.start;
          const Icon = config.icon;
          const isLast = i === events.length - 1;

          return (
            <div key={event.id} className={`relative flex gap-4 sm:gap-5 pb-8 ${isLast ? 'pb-0' : ''}`}>
              <div className={`relative z-10 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ring-4 ring-white ${config.color}`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                  <span className="text-xs text-slate-400">{formatDate(event.date)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
