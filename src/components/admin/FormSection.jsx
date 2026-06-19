import { AlertTriangle } from 'lucide-react';

export default function FormSection({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white overflow-hidden card-shadow ${className}`}>
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-brand-100 text-brand-700 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

export function inputClass(hasError) {
  return `w-full px-3 py-2.5 rounded-lg border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 ${
    hasError ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'
  }`;
}

export function PublicVisibilityWarning() {
  return (
    <div className="flex gap-3 p-4 sm:p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/60">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-900">Public visibility warning</p>
        <p className="text-sm text-amber-800/90 mt-1 leading-relaxed">
          This project will be immediately visible on the public portal. Citizens can view budget, tender, contractor, and progress details. Verify all information before publishing.
        </p>
      </div>
    </div>
  );
}
