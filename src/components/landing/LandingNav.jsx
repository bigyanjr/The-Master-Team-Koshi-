import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogIn, UserPlus, User, LogOut, Settings } from 'lucide-react';
import Button from '../ui/Button';
import BrandLogo from '../layout/BrandLogo';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#impact', label: 'QR Demo' },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, canAccessAdminPortal, profile, logout, loading: authLoading } = useAuth();

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
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-800 hover:bg-slate-50 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {!authLoading && (
                isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" icon={LayoutDashboard}>
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" icon={User}>
                        {profile?.fullName?.split(' ')[0] || 'Profile'}
                      </Button>
                    </Link>
                    {canAccessAdminPortal && (
                      <Link to="/admin">
                        <Button variant="primary" size="sm" icon={Settings}>
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button variant="secondary" size="sm" icon={LogOut} onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm" icon={LogIn}>
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="secondary" size="sm" icon={UserPlus}>
                        Register
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="primary" size="sm" icon={LayoutDashboard}>
                        Dashboard
                      </Button>
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
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </a>
              ))}
              <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={LayoutDashboard} className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={User} className="w-full">
                        Profile
                      </Button>
                    </Link>
                    {canAccessAdminPortal && (
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        <Button variant="primary" size="sm" icon={Settings} className="w-full">
                          Admin Portal
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" icon={LogOut} className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={LogIn} className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      <Button variant="primary" size="sm" icon={UserPlus} className="w-full">
                        Register
                      </Button>
                    </Link>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm" icon={LayoutDashboard} className="w-full">
                        View Dashboard
                      </Button>
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
