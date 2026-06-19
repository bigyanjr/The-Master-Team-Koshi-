export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 card-shadow ${hover ? 'transition-shadow hover:card-shadow-lg hover:border-slate-300/80' : ''} ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
