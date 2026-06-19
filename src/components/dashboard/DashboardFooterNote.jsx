import { MUNICIPALITY_DEMO, PRODUCT_NAME } from '../../config/branding';

export default function DashboardFooterNote({ municipality }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-5 py-4 text-center">
      <p className="text-xs text-slate-500">
        {PRODUCT_NAME} · {municipality?.name || MUNICIPALITY_DEMO}
        {municipality?.fiscalYear ? ` · FY ${municipality.fiscalYear}` : ''}
      </p>
      <p className="text-[11px] text-slate-400 mt-1">
        Open demo data for public transparency — not an official government record.
      </p>
    </div>
  );
}
