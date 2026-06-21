import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import BrandLogo from '../layout/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MUNICIPALITY_NAME, PRODUCT_NAME, TAGLINE,
  OFFICE_ADDRESS, OFFICE_PHONE, OFFICE_EMAIL, OFFICE_HOURS,
} from '../../config/branding';

/** Restart a quick press-bounce animation on the clicked link, every click. */
function handleBounceClick(e) {
  const el = e.currentTarget;
  el.classList.remove('animate-click-bounce');
  el.getBoundingClientRect(); // force reflow so the animation can restart
  el.classList.add('animate-click-bounce');
}

const BOUNCE_LINK_CLASS = 'inline-block hover:text-white transition-colors';

export default function LandingFooter() {
  const { canAccessAdminPortal } = useAuth();
  const { t } = useLanguage();

  return (
    <footer className="relative bg-emerald-950 text-white overflow-hidden">
      {/* Halftone banner accent — brand green fading into dots, filling the whole footer */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(115deg, #047857 0%, #065f46 35%, #064e3b 65%, #022c22 100%)' }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.35) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative page-container py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo to="/" size="lg" />
            <p className="text-lg font-bold text-slate-300 leading-relaxed mt-4 max-w-xs">
              Itahari ward budget transparency — for citizens and ward offices.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-wide mb-4">{t('footer.citizens.heading')}</h4>
            <ul className="space-y-2.5 text-lg font-bold text-slate-300">
              <li><Link to="/dashboard" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.publicSpending')}</Link></li>
              <li><Link to="/projects" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.wardProjects')}</Link></li>
              <li><Link to="/ask" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.askMitra')}</Link></li>
              <li><Link to="/complaints" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.shareFeedback')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-wide mb-4">{t('footer.wardOffice.heading')}</h4>
            <ul className="space-y-2.5 text-lg font-bold text-slate-300">
              {canAccessAdminPortal ? (
                <>
                  <li><Link to="/admin" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.wardOfficePortal')}</Link></li>
                  <li><Link to="/admin/add-project" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.addProject')}</Link></li>
                  <li><Link to="/admin/add-update" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.postUpdate')}</Link></li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    state={{ from: '/admin', requiresAdmin: true }}
                    onClick={handleBounceClick}
                    className={BOUNCE_LINK_CLASS}
                  >
                    {t('footer.link.wardOfficeLogin')}
                  </Link>
                </li>
              )}
              <li><Link to="/pitch" onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{t('footer.link.aboutProject')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-wide mb-4">{t('footer.contact.heading')}</h4>
            <ul className="space-y-3 text-lg font-bold text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{OFFICE_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <a href={`tel:${OFFICE_PHONE}`} onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{OFFICE_PHONE}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                <a href={`mailto:${OFFICE_EMAIL}`} onClick={handleBounceClick} className={BOUNCE_LINK_CLASS}>{OFFICE_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{OFFICE_HOURS}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-base font-bold text-slate-300">
          <p>© {new Date().getFullYear()} {PRODUCT_NAME} · {TAGLINE}</p>
          <span className="inline-flex items-center gap-2 font-extrabold text-white uppercase tracking-wide">
            <span className="relative inline-flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {t('footer.status')}
          </span>
          <p>{MUNICIPALITY_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
