import { MUNICIPALITY_NAME, PRODUCT_NAME } from '../../config/branding';

export default function DashboardFooterNote({ municipality }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-5 py-4 text-center dark:bg-slate-900 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {PRODUCT_NAME} · {municipality?.name || MUNICIPALITY_NAME}
        {municipality?.fiscalYear ? ` · FY ${municipality.fiscalYear}` : ''}
      </p>
      <p className="text-[11px] text-slate-400 mt-1 dark:text-slate-500">
        Public transparency portal — verify important details with your ward office.
      </p>
    </div>
  );
}
