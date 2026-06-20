import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  actionVariant = 'secondary',
  compact = false,
  children,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-14 px-6'}`}>
      <div className={`rounded-xl bg-slate-50 border border-slate-100 text-slate-400 mb-4 ${compact ? 'p-3' : 'p-4'}`}>
        <Icon className={compact ? 'h-6 w-6' : 'h-8 w-8'} strokeWidth={1.5} />
      </div>
      <h3 className={`font-semibold text-slate-900 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">{description}</p>
      )}
      {children}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-5">
          <Button variant={actionVariant} size="sm">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <Button className="mt-5" variant={actionVariant} size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
