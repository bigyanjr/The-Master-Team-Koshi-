import { getTrustLabel } from '../../utils/riskEngine';

const ringColors = {
  emerald: 'text-emerald-500',
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
};

export default function TrustScoreRing({ score, size = 'md' }) {
  const { label, color } = getTrustLabel(score);
  const dimensions = size === 'lg' ? 120 : size === 'sm' ? 64 : 88;
  const stroke = size === 'lg' ? 8 : size === 'sm' ? 5 : 6;
  const radius = (dimensions - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg width={dimensions} height={dimensions} className="-rotate-90">
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
            className={`${ringColors[color]} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-slate-900 ${size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
            {score}
          </span>
          {size !== 'sm' && <span className="text-[10px] text-slate-400 uppercase tracking-wide">Trust</span>}
        </div>
      </div>
      {size !== 'sm' && (
        <span className={`text-xs font-semibold ${ringColors[color]}`}>{label}</span>
      )}
    </div>
  );
}
