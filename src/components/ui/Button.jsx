const variants = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900 shadow-sm border border-brand-900/10',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  emerald: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm border border-emerald-800/10',
  amber: 'bg-amber-700 text-white hover:bg-amber-800 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-700 text-white hover:bg-red-800 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-5 py-3 text-sm rounded-lg gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 shrink-0 opacity-90" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 shrink-0 opacity-90" />}
    </button>
  );
}
