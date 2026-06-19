function scoreToColor(score) {
  if (score >= 80) return { ring: 'text-emerald-600', label: 'Low Risk', text: 'text-emerald-700' };
  if (score >= 50) return { ring: 'text-amber-500', label: 'Medium Risk', text: 'text-amber-700' };
  return { ring: 'text-red-500', label: 'High Risk', text: 'text-red-600' };
}

export default function TrustScoreRing({ score, size = 'md', showLabel = true }) {
  const { ring, label, text } = scoreToColor(score);
  const dimensions = size === 'lg' ? 112 : size === 'sm' ? 56 : 80;
  const stroke = size === 'lg' ? 7 : size === 'sm' ? 4 : 5;
  const radius = (dimensions - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg width={dimensions} height={dimensions} className="-rotate-90" aria-hidden>
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-100"
          />
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${ring} transition-all duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold tabular-nums text-slate-900 ${
            size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
          }`}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium">Trust</span>
          )}
        </div>
      </div>
      {showLabel && size !== 'sm' && (
        <span className={`text-[11px] font-semibold ${text}`}>{label}</span>
      )}
    </div>
  );
}

export { scoreToColor };
