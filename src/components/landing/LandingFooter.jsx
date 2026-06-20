import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import BrandLogo from '../layout/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MUNICIPALITY_NAME, PRODUCT_NAME, TAGLINE,
  OFFICE_ADDRESS, OFFICE_PHONE, OFFICE_EMAIL, OFFICE_HOURS,
} from '../../config/branding';

export default function LandingFooter() {
  const { canAccessAdminPortal } = useAuth();
  const { t } = useLanguage();

  return (
    <footer className="relative bg-emerald-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative page-container py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo to="/" size="lg" />
            <p className="text-sm text-slate-400 leading-relaxed mt-4 max-w-xs">
              Itahari ward budget transparency — for citizens and ward offices.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">{t('footer.citizens.heading')}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">{t('footer.link.publicSpending')}</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">{t('footer.link.wardProjects')}</Link></li>
              <li><Link to="/ask" className="hover:text-white transition-colors">{t('footer.link.askMitra')}</Link></li>
              <li><Link to="/complaints" className="hover:text-white transition-colors">{t('footer.link.shareFeedback')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">{t('footer.wardOffice.heading')}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {canAccessAdminPortal ? (
                <>
                  <li><Link to="/admin" className="hover:text-white transition-colors">{t('footer.link.wardOfficePortal')}</Link></li>
                  <li><Link to="/admin/add-project" className="hover:text-white transition-colors">{t('footer.link.addProject')}</Link></li>
                  <li><Link to="/admin/add-update" className="hover:text-white transition-colors">{t('footer.link.postUpdate')}</Link></li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    state={{ from: '/admin', requiresAdmin: true }}
                    className="hover:text-white transition-colors"
                  >
                    {t('footer.link.wardOfficeLogin')}
                  </Link>
                </li>
              )}
              <li><Link to="/pitch" className="hover:text-white transition-colors">{t('footer.link.aboutProject')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">{t('footer.contact.heading')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{OFFICE_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <a href={`tel:${OFFICE_PHONE}`} className="hover:text-white transition-colors">{OFFICE_PHONE}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                <a href={`mailto:${OFFICE_EMAIL}`} className="hover:text-white transition-colors">{OFFICE_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{OFFICE_HOURS}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME} · {TAGLINE}</p>
          <p>{MUNICIPALITY_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
