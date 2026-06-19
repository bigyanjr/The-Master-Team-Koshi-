import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/add-project', label: 'Add Project', icon: PlusCircle },
  { to: '/admin/add-update', label: 'Post Update', icon: FileText },
];

export default function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Public Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Ward Admin Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage projects, updates, and transparency records</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56 shrink-0">
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
                  <Icon className="h-4 w-4" />
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
