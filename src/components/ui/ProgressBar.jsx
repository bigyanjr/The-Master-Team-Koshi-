export default function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  showLabel = true,
  color = 'auto',
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  let barColor = 'bg-brand-700';
  if (color === 'auto') {
    if (pct >= 80) barColor = 'bg-emerald-600';
    else if (pct >= 40) barColor = 'bg-brand-700';
    else barColor = 'bg-amber-600';
  } else if (color === 'emerald') barColor = 'bg-emerald-600';
  else if (color === 'amber') barColor = 'bg-amber-600';
  else if (color === 'red') barColor = 'bg-red-600';

  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-2.5' : 'h-2';

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-500 font-medium dark:text-slate-400">Progress</span>
          <span className="font-semibold text-slate-800 tabular-nums dark:text-red-400">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800 ${height}`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
