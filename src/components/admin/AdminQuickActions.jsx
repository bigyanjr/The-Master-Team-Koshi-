import { Link } from 'react-router-dom';
import { FileText, PlusCircle, Camera, MessageSquareWarning } from 'lucide-react';

const actions = [
  { to: '/admin/add-update', label: 'Post Update', icon: FileText, color: 'bg-brand-800' },
  { to: '/admin/add-project', label: 'Add Project', icon: PlusCircle, color: 'bg-brand-700' },
  { to: '/admin/upload-proof', label: 'Upload Proof', icon: Camera, color: 'bg-emerald-700' },
  { to: '/admin/complaints', label: 'Review Complaints', icon: MessageSquareWarning, color: 'bg-amber-600' },
];

export default function AdminQuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map(({ to, label, icon: Icon, color }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl ${color} text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center`}
        >
          <Icon className="h-6 w-6 opacity-90" />
          <span className="text-sm font-bold">{label}</span>
        </Link>
      ))}
    </div>
  );
}
