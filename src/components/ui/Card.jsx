export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 card-shadow ${hover ? 'transition-all duration-200 hover:card-shadow-md hover:border-slate-300/80' : ''} ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
      <div className="min-w-0">
        {title && <h3 className="text-base font-semibold text-slate-900 leading-snug">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
