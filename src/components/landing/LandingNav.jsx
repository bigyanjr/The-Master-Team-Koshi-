import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Globe,
  Bell,
  Home,
  LayoutDashboard,
  FolderKanban,
  MessageSquareWarning,
  Bot,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import Button from '../ui/Button';
import BrandLogo from '../layout/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const navLinks = [
  { to: '/', labelKey: 'nav.home', icon: Home, end: true },
  { to: '/dashboard', labelKey: 'nav.spending', icon: LayoutDashboard },
  { to: '/projects', labelKey: 'nav.projects', icon: FolderKanban },
  { to: '/ask', labelKey: 'nav.ask', icon: Bot },
  { to: '/complaints', labelKey: 'nav.feedback', icon: MessageSquareWarning },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, canAccessAdminPortal, logout, loading: authLoading, profile } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  // fullName isn't required for ward-admin accounts at registration, so it
  // can be empty — fall back through position title, username, and the
  // email's local part (every account has one) before the generic
  // translated "Profile" label.
  const displayName = profile?.fullName?.trim()
    || profile?.positionTitle?.trim()
    || profile?.username?.trim()
    || profile?.email?.split('@')[0];
  const profileLabel = displayName?.split(' ')[0] || t('auth.profile');

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-[60]">
      <div className="page-container pt-0 pb-3.5">
        <div className="bg-white/95 backdrop-blur-md border border-black rounded-b-3xl card-shadow dark:bg-slate-900/95 dark:border-black">
          <div className="flex items-center gap-4 px-4 py-2.5 sm:px-6 sm:py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <BrandLogo to="/" size="md" className="shrink-0" />
              <div className="hidden sm:flex flex-col min-w-0 leading-tight">
                <span className="text-xl font-extrabold text-emerald-800 tracking-tight dark:text-emerald-400">Ward Mitra</span>
                <span className="text-sm font-medium text-slate-500 truncate dark:text-slate-400">{t('header.subtitle')}</span>
              </div>
            </div>

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5">
              {navLinks.map(({ to, labelKey, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-full text-base font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:text-emerald-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  <span>{t(labelKey)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="hidden xl:flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label="Toggle language"
                title="Switch language / भाषा परिवर्तन गर्नुहोस्"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'English' : 'नेपाली'}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <ThemeToggle />
            </div>

            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              {!authLoading && (
                isAuthenticated ? (
                  <>
                    {canAccessAdminPortal && (
                      <Link to="/admin">
                        <Button variant="emerald" size="md" icon={Settings}>{t('auth.wardOffice')}</Button>
                      </Link>
                    )}
                    <Link to="/profile">
                      <Button variant="ghost" size="md" icon={User}>{profileLabel}</Button>
                    </Link>
                    <Button variant="secondary" size="md" icon={LogOut} onClick={handleLogout}>{t('auth.logout')}</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="emerald" size="md" icon={LogIn}>{t('auth.login')}</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="secondary" size="md" icon={UserPlus}>{t('auth.register')}</Button>
                    </Link>
                  </>
                )
              )}
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="xl:hidden inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Globe className="h-4 w-4" />
            </button>

            <ThemeToggle className="xl:hidden" />

            <button
              type="button"
              className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 focus-ring shrink-0 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-1 dark:border-slate-800">
              {navLinks.map(({ to, labelKey, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 opacity-70" />
                  {t(labelKey)}
                </NavLink>
              ))}
              <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2 dark:border-slate-800">
                {isAuthenticated ? (
                  <>
                    {canAccessAdminPortal && (
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        <Button variant="emerald" size="sm" icon={Settings} className="w-full">{t('auth.wardOfficePortal')}</Button>
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={User} className="w-full">{profileLabel}</Button>
                    </Link>
                    <Button variant="ghost" size="sm" icon={LogOut} className="w-full" onClick={handleLogout}>{t('auth.logout')}</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button variant="emerald" size="sm" icon={LogIn} className="w-full">{t('auth.login')}</Button>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      <Button variant="secondary" size="sm" icon={UserPlus} className="w-full">{t('auth.register')}</Button>
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
