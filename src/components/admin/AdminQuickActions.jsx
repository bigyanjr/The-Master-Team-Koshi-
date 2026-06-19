import { Link } from 'react-router-dom';
import { PlusCircle, Banknote, Camera, MessageSquareWarning } from 'lucide-react';

const actions = [
  {
    to: '/admin/add-project',
    label: 'Add New Project',
    desc: 'Register a ward project for public tracking',
    icon: PlusCircle,
    color: 'bg-brand-600 hover:bg-brand-700 text-white',
  },
  {
    to: '/admin/add-payment',
    label: 'Add Payment Update',
    desc: 'Record a milestone payment release',
    icon: Banknote,
    color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    to: '/admin/upload-proof',
    label: 'Upload Proof',
    desc: 'Add before/during/after photos or documents',
    icon: Camera,
    color: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    to: '/admin/complaints',
    label: 'Review Complaints',
    desc: 'Respond to citizen transparency reports',
    icon: MessageSquareWarning,
    color: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
];

export default function AdminQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map(({ to, label, desc, icon: Icon, color }) => (
        <Link
          key={to}
          to={to}
          className={`group flex items-start gap-3 p-4 rounded-2xl ${color} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
        >
          <div className="p-2 rounded-xl bg-white/20 shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight">{label}</p>
            <p className="text-xs opacity-80 mt-1 leading-snug">{desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
