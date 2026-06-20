import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import {
  MUNICIPALITY_NAME, PRODUCT_NAME, TAGLINE,
  OFFICE_ADDRESS, OFFICE_PHONE, OFFICE_EMAIL, OFFICE_HOURS,
} from '../../config/branding';

export default function Footer() {
  const { canAccessAdminPortal } = useAuth();

  return (
    <footer className="bg-white border-t border-slate-200/90 mt-auto dark:bg-slate-950 dark:border-slate-800">
      <div className="page-container py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo to="/" size="lg" />
            <p className="text-sm text-slate-500 leading-relaxed mt-4 max-w-xs dark:text-slate-400">
              Public spending records for Itahari wards — projects, payments, proof photos, and citizen feedback.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 dark:text-slate-100">For citizens</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Public spending</Link></li>
              <li><Link to="/projects" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Ward projects</Link></li>
              <li><Link to="/ask" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Ask Ward Mitra</Link></li>
              <li><Link to="/complaints" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Share feedback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 dark:text-slate-100">For ward office</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              {canAccessAdminPortal ? (
                <>
                  <li><Link to="/admin" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Ward office portal</Link></li>
                  <li><Link to="/admin/add-project" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Add project</Link></li>
                  <li><Link to="/admin/add-update" className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">Post update</Link></li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    state={{ from: '/admin', requiresAdmin: true }}
                    className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400"
                  >
                    Ward office login
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 dark:text-slate-100">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-700 dark:text-emerald-400" />
                <span>{OFFICE_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-700 dark:text-emerald-400" />
                <a href={`tel:${OFFICE_PHONE}`} className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">{OFFICE_PHONE}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-brand-700 dark:text-emerald-400" />
                <a href={`mailto:${OFFICE_EMAIL}`} className="hover:text-brand-800 transition-colors dark:hover:text-emerald-400">{OFFICE_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-brand-700 dark:text-emerald-400" />
                <span>{OFFICE_HOURS}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME} · {TAGLINE}</p>
          <p>{MUNICIPALITY_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
