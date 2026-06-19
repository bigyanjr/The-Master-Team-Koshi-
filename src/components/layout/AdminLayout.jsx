import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FileText, Banknote, Camera, MessageSquareWarning, ArrowLeft, Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { getWardByNo } from '../../utils/formatters';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/add-project', label: 'Add Project', icon: PlusCircle },
  { to: '/admin/add-payment', label: 'Add Payment', icon: Banknote },
  { to: '/admin/upload-proof', label: 'Upload Proof', icon: Camera },
  { to: '/admin/add-update', label: 'Post Update', icon: FileText },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
];

export default function AdminLayout() {
  const { wards, demoAdminWard } = useData();
  const ward = getWardByNo(wards, demoAdminWard);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Admin header bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Public Portal
            </Link>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <h1 className="text-2xl font-bold text-slate-900">Ward Admin Portal</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-900 text-emerald-300 text-xs font-semibold ring-1 ring-brand-700">
                <Shield className="h-3.5 w-3.5" />
                Ward IT Admin Demo
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {ward ? `Logged in as Ward ${ward.number} — ${ward.name}` : 'Demo mode · No authentication'}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-60 shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200/80 p-2 card-shadow space-y-0.5">
              {adminNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
