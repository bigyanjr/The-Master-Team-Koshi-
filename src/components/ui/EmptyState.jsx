import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-14 px-6'}`}>
      <div className={`rounded-xl bg-slate-50 border border-slate-100 text-slate-400 mb-4 ${compact ? 'p-3' : 'p-4'}`}>
        <Icon className={compact ? 'h-6 w-6' : 'h-8 w-8'} strokeWidth={1.5} />
      </div>
      <h3 className={`font-semibold text-slate-900 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-5" variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
