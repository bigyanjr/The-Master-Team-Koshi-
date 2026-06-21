import { Link } from 'react-router-dom';
import BrandLogo from '../layout/BrandLogo';
import { PRODUCT_NAME, TAGLINE } from '../../config/branding';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen dashboard-bg flex flex-col">
      <div className="page-container py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <BrandLogo to="/" size="lg" className="mx-auto" />
            </Link>
            <p className="mt-4 text-sm font-medium text-slate-500">{PRODUCT_NAME}</p>
            <p className="text-xs text-slate-400 mt-0.5">{TAGLINE}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 card-shadow-lg">
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Itahari ward budget transparency
          </p>
        </div>
      </div>
    </div>
  );
}
