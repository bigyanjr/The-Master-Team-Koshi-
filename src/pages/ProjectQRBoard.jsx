import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, ArrowLeft, Printer, ScanLine, Building2, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { findViewableProject } from '../utils/projectVisibility';
import { StatusBadge } from '../components/ui/Badge';
import { formatCurrency, getWardByNo } from '../utils/formatters';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { getProjectScanUrl } from '../utils/qrUrl';
import { PRODUCT_NAME, TAGLINE } from '../config/branding';

export default function ProjectQRBoard() {
  const { id } = useParams();
  const { projects, wards, municipality } = useData();
  const { profile } = useAuth();
  const project = findViewableProject(projects, id, profile);
  const ward = project ? getWardByNo(wards, project.wardNo) : null;
  // Embed a live snapshot in the QR itself — see root-cause note in
  // utils/qrUrl.js — so printed boards work on a phone that has never
  // loaded this app (no shared backend without Firebase configured). The
  // printed text underneath stays short and readable; only the QR image
  // carries the full data-bearing link.
  const url = getProjectScanUrl(id, project, projects);
  const displayUrl = getProjectScanUrl(id);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === '1') {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-100">
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="This project may not be published yet or may have been removed."
          actionLabel="View Public Dashboard"
          actionTo="/dashboard"
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; }
          .qr-board { box-shadow: none !important; page-break-inside: avoid; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-300 py-8 px-4 print:bg-white print:py-0">
        <div className="no-print max-w-3xl mx-auto mb-6 flex flex-wrap gap-3">
          <Link to={`/projects/${id}`}>
            <Button variant="secondary" size="sm" icon={ArrowLeft}>Back to project</Button>
          </Link>
          <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Site QR Board
          </Button>
          <Link to={`/scan/${id}`} target="_blank">
            <Button variant="emerald" size="sm" icon={ScanLine}>Test mobile scan</Button>
          </Link>
        </div>

        <div className="qr-board max-w-3xl mx-auto bg-white overflow-hidden shadow-2xl print:max-w-none print:w-full print:shadow-none">
          {/* Government header stripe */}
          <div className="h-3 bg-gradient-to-r from-brand-900 via-emerald-700 to-brand-900" />
          <div className="h-1 bg-amber-400" />

          <div className="bg-brand-900 text-white px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
                <Shield className="h-9 w-9 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{PRODUCT_NAME}</p>
                <p className="text-sm text-emerald-300/90 font-medium">{TAGLINE.replace(', ', ' · ')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black tracking-tight">WARD {project.wardNo}</p>
              {ward && <p className="text-sm text-brand-200 font-medium">{ward.name}</p>}
            </div>
          </div>

          {/* Municipality bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            {municipality.name} · Public Project Transparency Board
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-3 space-y-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 mb-2">
                    Official Public Record
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {project.title}
                  </h1>
                  <p className="text-sm text-slate-500 mt-2">{project.location}</p>
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-brand-50 border-2 border-brand-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-600">Allocated Budget</dt>
                    <dd className="text-lg font-black text-slate-900 mt-1">{formatCurrency(project.allocatedBudget)}</dd>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-emerald-700">Progress</dt>
                    <dd className="text-lg font-black text-slate-900 mt-1">{project.progressPercent}%</dd>
                  </div>
                  <div className="col-span-2 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Contractor</dt>
                    <dd className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                      {project.contractorName || 'Tender in progress — not yet assigned'}
                    </dd>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Status:</span>
                    <StatusBadge status={project.status} />
                  </div>
                </dl>

                <div className="p-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/80">
                  <p className="text-base font-bold text-emerald-900 leading-snug">
                    Scan to track public money and project progress
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    View budget · contractor · payments · proof photos · risk flags · citizen feedback
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-brand-900/10 rounded-2xl" />
                  <div className="relative p-4 bg-white border-4 border-brand-900 rounded-2xl shadow-lg">
                    {/* level="Q" — still decent damage tolerance for a
                        printed sign, but lower module density than "H" so
                        the embedded data snapshot (see qrUrl.js) scans
                        reliably from a phone camera. */}
                    <QRCodeSVG value={url} size={200} level="Q" includeMargin />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-800 uppercase tracking-wide">
                  <ScanLine className="h-4 w-4" />
                  Scan with phone camera
                </div>
                <p className="text-[9px] text-slate-400 mt-2 text-center break-all max-w-[220px] leading-relaxed">{displayUrl}</p>
              </div>
            </div>
          </div>

          <div className="h-1 bg-amber-400" />
          <div className="bg-gradient-to-r from-emerald-700 to-brand-800 text-white px-6 py-4 text-center">
            <p className="text-sm font-bold">Citizen Transparency Portal</p>
            <p className="text-xs text-emerald-200/90 mt-1">
              Report concerns · Verify work on site · Hold ward officials accountable
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
