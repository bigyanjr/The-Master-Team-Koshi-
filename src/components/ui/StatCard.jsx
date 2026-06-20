export default function StatCard({ label, value, subtext, icon: Icon, trend, color = 'brand' }) {
  const iconColors = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 card-shadow dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight dark:text-slate-50">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">{subtext}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-1.5 ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconColors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
