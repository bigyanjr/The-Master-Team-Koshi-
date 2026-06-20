import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROJECT_IDS, MUNICIPALITY_DEMO, PRODUCT_NAME, TAGLINE } from '../../config/branding';

export default function Footer() {
  const { canAccessAdminPortal } = useAuth();

  return (
    <footer className="bg-white border-t border-slate-200/90 mt-auto">
      <div className="page-container py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo to="/" size="lg" />
            <p className="text-sm text-slate-500 leading-relaxed mt-4 max-w-xs">
              Open budget transparency for Itahari wards — tenders, payments, proofs, and citizen feedback in one place.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Public Portal</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><Link to="/dashboard" className="hover:text-brand-800 transition-colors">Dashboard</Link></li>
              <li><Link to="/projects" className="hover:text-brand-800 transition-colors">All Projects</Link></li>
              <li><Link to="/ask" className="hover:text-brand-800 transition-colors">Citizen Query Bot</Link></li>
              <li><Link to="/complaints" className="hover:text-brand-800 transition-colors">Citizen Feedback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">For Officials</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {canAccessAdminPortal ? (
                <>
                  <li><Link to="/admin" className="hover:text-brand-800 transition-colors">Admin Dashboard</Link></li>
                  <li><Link to="/admin/add-project" className="hover:text-brand-800 transition-colors">Add Project</Link></li>
                  <li><Link to="/admin/add-update" className="hover:text-brand-800 transition-colors">Post Update</Link></li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    state={{ from: '/admin', requiresAdmin: true }}
                    className="hover:text-brand-800 transition-colors"
                  >
                    Ward Admin Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Demo</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><Link to="/pitch" className="hover:text-brand-800 transition-colors">Pitch Mode</Link></li>
              <li><Link to={`/qr-demo/${DEMO_PROJECT_IDS.qrScan}`} className="hover:text-brand-800 transition-colors">Scan QR Demo</Link></li>
              <li><Link to={`/projects/${DEMO_PROJECT_IDS.drainage}`} className="hover:text-brand-800 transition-colors">Risk Demo Project</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-400">
          <p>© 2025 {PRODUCT_NAME} · {TAGLINE}</p>
          <p>{MUNICIPALITY_DEMO} · Local data MVP</p>
        </div>
      </div>
    </footer>
  );
}
