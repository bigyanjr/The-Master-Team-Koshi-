import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, FolderKanban, MessageSquareWarning, Settings, Bot,
  LogIn, UserPlus, User, LogOut,
} from 'lucide-react';
import Button from '../ui/Button';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../context/AuthContext';

const publicNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/ask', label: 'Ask AI', icon: Bot },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isWardAdmin, profile, logout, loading: authLoading } = useAuth();
  const isAdmin = location.pathname.startsWith('/admin');
  const [menuPath, setMenuPath] = useState(null);
  const mobileOpen = menuPath === location.pathname;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMenu = () => setMenuPath(null);
  const toggleMenu = () => setMenuPath(mobileOpen ? null : location.pathname);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="page-container">
          <div className="flex items-center min-h-[4.25rem] sm:min-h-[4.5rem] gap-3 sm:gap-4">
            <BrandLogo to="/" size="nav" className="shrink-0 -ml-1 sm:ml-0" />

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5 min-w-0">
              {publicNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              {!authLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="hidden sm:block">
                        <Button variant="ghost" size="sm" icon={User}>
                          {profile?.fullName?.split(' ')[0] || 'Profile'}
                        </Button>
                      </Link>
                      {isWardAdmin && (
                        <Link to="/admin" className="hidden sm:block">
                          <Button variant={isAdmin ? 'primary' : 'secondary'} size="sm" icon={Settings}>
                            Admin
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={LogOut}
                        onClick={handleLogout}
                        className="hidden sm:inline-flex"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="hidden sm:block">
                        <Button variant="ghost" size="sm" icon={LogIn}>
                          Login
                        </Button>
                      </Link>
                      <Link to="/register" className="hidden sm:block">
                        <Button variant="secondary" size="sm" icon={UserPlus}>
                          Register
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 focus-ring shrink-0"
                onClick={toggleMenu}
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeMenu}
            aria-label="Close menu"
          />
          <nav className="absolute top-[4.5rem] inset-x-0 bottom-0 bg-white border-t border-slate-100 overflow-y-auto">
            <div className="page-container py-4 space-y-1">
              {publicNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 opacity-70" />
                  {label}
                </NavLink>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={closeMenu} className="block">
                      <Button variant="secondary" size="md" icon={User} className="w-full">
                        Profile
                      </Button>
                    </Link>
                    {isWardAdmin && (
                      <Link to="/admin" onClick={closeMenu} className="block">
                        <Button variant="primary" size="md" icon={Settings} className="w-full">
                          Ward Admin Portal
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="md"
                      icon={LogOut}
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMenu} className="block">
                      <Button variant="secondary" size="md" icon={LogIn} className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMenu} className="block">
                      <Button variant="primary" size="md" icon={UserPlus} className="w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
