import { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FileText, Banknote, Camera,
  MessageSquareWarning, ArrowLeft, Shield, Menu, X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getWardByNo } from '../../utils/formatters';
import BrandLogo from './BrandLogo';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ROLES } from '../../services/authService';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/add-project', label: 'Add Project', icon: PlusCircle },
  { to: '/admin/add-payment', label: 'Add Payment', icon: Banknote },
  { to: '/admin/upload-proof', label: 'Upload Proof', icon: Camera },
  { to: '/admin/add-update', label: 'Post Update', icon: FileText },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
];

function AdminNavLinks({ onNavigate, className = '' }) {
  return (
    <nav className={`space-y-0.5 ${className}`}>
      {adminNav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0 opacity-90" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { wards } = useData();
  const { profile, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const adminWardNo = profile?.wardNo ?? 1;
  const ward = getWardByNo(wards, adminWardNo);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center dashboard-bg">
        <LoadingSpinner label="Verifying ward admin access…" />
      </div>
    );
  }

  if (!isAuthenticated || profile?.role !== ROLES.WARD_ADMIN) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, requiresAdmin: true }}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] dashboard-bg">
      {/* Admin top bar */}
      <div className="bg-white border-b border-slate-200/90">
        <div className="page-container py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <BrandLogo to="/dashboard" size="nav" />
              <div className="hidden sm:block h-8 w-px bg-slate-200" />
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">Ward Admin Portal</p>
                <p className="text-xs text-slate-500 truncate">
                  {profile?.fullName ? `${profile.fullName} · ` : ''}
                  {ward ? `Ward ${ward.number} — ${ward.name}` : 'Demo mode'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-900 text-emerald-300 text-[10px] font-bold uppercase tracking-wide">
                <Shield className="h-3 w-3" />
                {profile?.fullName || 'Ward Admin'}
              </span>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-800 px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Public portal
              </Link>
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-6 sm:py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-slate-200/90 p-2 card-shadow">
              <AdminNavLinks />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close"
          />
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-slate-900">Admin Menu</span>
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminNavLinks onNavigate={() => setSidebarOpen(false)} className="flex-1" />
          </aside>
        </div>
      )}
    </div>
  );
}
