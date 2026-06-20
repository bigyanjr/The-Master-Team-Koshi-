import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu, X, Home, LayoutDashboard, FolderKanban, MessageSquareWarning, Bot, LogIn, UserPlus, User, LogOut, Settings,
} from 'lucide-react';
import Button from '../ui/Button';
import BrandLogo from '../layout/BrandLogo';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/ask', label: 'Ask Ward Mitra', icon: Bot },
  { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, canAccessAdminPortal, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="page-container pt-4">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl card-shadow">
          <div className="flex items-center min-h-[4.25rem] sm:min-h-[4.5rem] pl-2 sm:pl-3 pr-3 sm:pr-5 gap-3">
            <BrandLogo to="/" size="nav" className="shrink-0 mr-1" />

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5 min-w-0">
              {navLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:text-brand-800 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {!authLoading && (
                isAuthenticated ? (
                  <>
                    {canAccessAdminPortal && (
                      <Link to="/admin">
                        <Button variant="primary" size="sm" icon={Settings}>Admin</Button>
                      </Link>
                    )}
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" icon={User}>Profile</Button>
                    </Link>
                    <Button variant="secondary" size="sm" icon={LogOut} onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="primary" size="sm" icon={LogIn}>Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="secondary" size="sm" icon={UserPlus}>Register</Button>
                    </Link>
                  </>
                )
              )}
            </div>

            <button
              type="button"
              className="lg:hidden ml-auto p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 focus-ring shrink-0"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 opacity-70" />
                  {label}
                </NavLink>
              ))}
              <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {canAccessAdminPortal && (
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        <Button variant="primary" size="sm" icon={Settings} className="w-full">Admin Dashboard</Button>
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={User} className="w-full">Profile</Button>
                    </Link>
                    <Button variant="ghost" size="sm" icon={LogOut} className="w-full" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button variant="primary" size="sm" icon={LogIn} className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={UserPlus} className="w-full">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
