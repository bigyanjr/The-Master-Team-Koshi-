export default function LoadingSpinner({ size = 'md', label, className = '' }) {
  const dim = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${dim} rounded-full border-2 border-slate-200 border-t-brand-700 animate-spin dark:border-slate-700 dark:border-t-emerald-500`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm text-slate-500 font-medium dark:text-slate-400">{label}</p>}
    </div>
  );
}

export function LoadingOverlay({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner label={label} />
    </div>
  );
}
