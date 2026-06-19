import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, LayoutDashboard, Settings } from 'lucide-react';
import Button from '../ui/Button';

const navLinks = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#features', label: 'Features' },
  { href: '#impact', label: 'Impact' },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-brand-800 to-brand-900 text-emerald-400 shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">WardWatch</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-800 hover:bg-brand-50/80 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" icon={LayoutDashboard}>
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="primary" size="sm" icon={Settings}>
                  Admin Demo
                </Button>
              </Link>
            </div>

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setOpen(!open)}
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
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="secondary" size="sm" icon={LayoutDashboard} className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/admin" onClick={() => setOpen(false)}>
                  <Button variant="primary" size="sm" icon={Settings} className="w-full">
                    Admin Demo
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
