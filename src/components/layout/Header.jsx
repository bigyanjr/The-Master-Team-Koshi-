import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LayoutDashboard, FolderKanban, MessageSquareWarning, Settings } from 'lucide-react';
import Button from '../ui/Button';

const publicNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-xl bg-brand-900 text-emerald-400 group-hover:bg-brand-800 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-none">WardWatch</span>
              <span className="hidden sm:block text-[10px] text-slate-400 leading-none">Public Money, Public Visibility</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {publicNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/admin" className="hidden sm:block">
              <Button
                variant={isAdmin ? 'primary' : 'secondary'}
                size="sm"
                icon={Settings}
              >
                Admin
              </Button>
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {publicNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <Link to="/admin" onClick={() => setMobileOpen(false)} className="block pt-2">
            <Button variant="secondary" size="sm" icon={Settings} className="w-full">
              Admin Portal
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
