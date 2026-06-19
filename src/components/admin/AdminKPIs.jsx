import {
  Wallet, FolderKanban, Clock, MessageSquareWarning, AlertTriangle,
} from 'lucide-react';
import { formatCompactCurrency } from '../../utils/formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getAllComplaints,
} from '../../utils/riskEngine';

const iconStyles = {
  brand: 'bg-brand-100 text-brand-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export default function AdminKPIs({ projects, wards, demoWardNo }) {
  const ward = wards.find((w) => w.number === demoWardNo);
  const wardProjects = projects.filter((p) => p.wardNo === demoWardNo);
  const allComplaints = getAllComplaints(projects);
  const wardComplaints = allComplaints.filter((c) => c.wardNo === demoWardNo);

  const pendingComplaints = wardComplaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review' || c.status === 'Verified'
  ).length;

  const highRisk = wardProjects.filter((p) => calculateTrustScore(p) < 50).length;

  const pendingUpdates = wardProjects.filter((p) => {
    const flags = getRiskFlags(p);
    return flags.some((f) =>
      f.id === 'PAYMENT_WITHOUT_PROOF' || f.id === 'DELAYED_PROJECT'
    ) || (p.status === 'Ongoing' && (p.payments?.length ?? 0) > (p.proofs?.length ?? 0));
  }).length;

  const kpis = [
    {
      label: 'My Ward Budget',
      value: formatCompactCurrency(ward?.allocatedBudget ?? 0),
      sub: ward?.name ?? `Ward ${demoWardNo}`,
      icon: Wallet,
      color: 'brand',
    },
    {
      label: 'Projects Managed',
      value: wardProjects.length,
      sub: `${projects.length} total municipality-wide`,
      icon: FolderKanban,
      color: 'emerald',
    },
    {
      label: 'Pending Updates',
      value: pendingUpdates,
      sub: 'Need payment or proof posts',
      icon: Clock,
      color: 'amber',
    },
    {
      label: 'Complaints Pending',
      value: pendingComplaints,
      sub: 'Awaiting ward review',
      icon: MessageSquareWarning,
      color: pendingComplaints > 0 ? 'red' : 'emerald',
    },
    {
      label: 'High Risk Projects',
      value: highRisk,
      sub: 'Trust score below 50',
      icon: AlertTriangle,
      color: highRisk > 0 ? 'red' : 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {kpis.map(({ label, value, sub, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 card-shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
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
