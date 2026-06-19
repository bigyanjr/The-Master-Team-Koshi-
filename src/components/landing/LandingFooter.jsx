import { Link } from 'react-router-dom';
import BrandLogo from '../layout/BrandLogo';
import { DEMO_PROJECT_IDS, MUNICIPALITY_DEMO, PRODUCT_NAME, TAGLINE } from '../../config/branding';

export default function LandingFooter() {
  return (
    <footer className="relative bg-brand-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative page-container py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo to="/" size="lg" />
            <p className="text-sm text-slate-400 leading-relaxed mt-4 max-w-xs">
              Itahari ward budget transparency — for citizens, ward teams, and public accountability.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Public Portal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">All Projects</Link></li>
              <li><Link to="/ask" className="hover:text-white transition-colors">Citizen Query Bot</Link></li>
              <li><Link to="/complaints" className="hover:text-white transition-colors">Citizen Feedback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Demo</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to={`/qr-demo/${DEMO_PROJECT_IDS.qrScan}`} className="hover:text-white transition-colors">Scan QR Demo</Link></li>
              <li><Link to={`/projects/${DEMO_PROJECT_IDS.drainage}`} className="hover:text-white transition-colors">Risk Demo Project</Link></li>
              <li>
                <Link
                  to="/login"
                  state={{ from: '/admin', requiresAdmin: true }}
                  className="hover:text-white transition-colors"
                >
                  Ward Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
          <p>© 2025 {PRODUCT_NAME} · {TAGLINE}</p>
          <p>{MUNICIPALITY_DEMO} · Hackathon MVP</p>
        </div>
      </div>
    </footer>
  );
}
