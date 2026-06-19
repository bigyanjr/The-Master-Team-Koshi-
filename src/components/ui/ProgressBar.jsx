export default function ProgressBar({ value = 0, max = 100, size = 'md', showLabel = true, color = 'auto', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  let barColor = 'bg-brand-600';
  if (color === 'auto') {
    if (pct >= 80) barColor = 'bg-emerald-500';
    else if (pct >= 40) barColor = 'bg-brand-600';
    else barColor = 'bg-amber-500';
  } else if (color === 'emerald') barColor = 'bg-emerald-500';
  else if (color === 'amber') barColor = 'bg-amber-500';
  else if (color === 'red') barColor = 'bg-red-500';

  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
