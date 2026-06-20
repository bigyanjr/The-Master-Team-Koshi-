import {
  Wallet, FolderKanban, Clock, MessageSquareWarning, AlertTriangle,
} from 'lucide-react';
import { formatCompactCurrency } from '../../utils/formatters';
import { formatWardLabel } from '../../constants/wards';
import {
  getRiskFlags,
  getAllComplaints,
  hasEnoughRiskData,
} from '../../utils/riskEngine';

const iconStyles = {
  brand: 'bg-brand-100 text-brand-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export default function AdminKPIs({ projects, demoWardNo }) {
  const wardProjects = projects.filter((p) => p.wardNo === demoWardNo);
  const allComplaints = getAllComplaints(projects);
  const wardComplaints = allComplaints.filter((c) => c.wardNo === demoWardNo);

  const pendingFeedback = wardComplaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review' || c.status === 'Verified',
  ).length;

  const needsFollowUp = wardProjects.filter((p) => {
    if (!hasEnoughRiskData(p)) return false;
    const flags = getRiskFlags(p, projects);
    return flags.some((f) =>
      f.id === 'PAYMENT_WITHOUT_PROOF' || f.id === 'DELAYED_BEYOND_DEADLINE',
    ) || (p.status === 'Ongoing' && (p.payments?.length ?? 0) > (p.proofs?.length ?? 0));
  }).length;

  const missingProof = wardProjects.filter((p) =>
    hasEnoughRiskData(p) && getRiskFlags(p, projects).some((f) => f.id === 'PAYMENT_WITHOUT_PROOF'),
  ).length;

  const kpis = [
    {
      label: 'Ward Budget',
      value: formatCompactCurrency(
        wardProjects.reduce((sum, p) => sum + (p.allocatedBudget ?? 0), 0),
      ),
      sub: formatWardLabel(demoWardNo),
      icon: Wallet,
      color: 'brand',
    },
    {
      label: 'Projects',
      value: wardProjects.length,
      sub: wardProjects.length === 1 ? '1 in your ward' : `${wardProjects.length} in your ward`,
      icon: FolderKanban,
      color: 'emerald',
    },
    {
      label: 'Posts Needed',
      value: needsFollowUp,
      sub: 'Payment or proof missing',
      icon: Clock,
      color: 'amber',
    },
    {
      label: 'Feedback Waiting',
      value: pendingFeedback,
      sub: 'Citizen messages to review',
      icon: MessageSquareWarning,
      color: pendingFeedback > 0 ? 'red' : 'emerald',
    },
    {
      label: 'Missing Proof',
      value: missingProof,
      sub: 'Payments without photos',
      icon: AlertTriangle,
      color: missingProof > 0 ? 'amber' : 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {kpis.map(({ label, value, sub, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 card-shadow hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 dark:text-red-400">{value}</p>
              <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">{sub}</p>
            </div>
            <div className={`p-2.5 rounded-xl shrink-0 ${iconStyles[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
