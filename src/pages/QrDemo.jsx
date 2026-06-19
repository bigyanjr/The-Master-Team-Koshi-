import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ScanLine, Smartphone, ArrowLeft, Shield, Info } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BrandLogo from '../components/layout/BrandLogo';
import { getProjectScanUrl, isLocalhostUrl } from '../utils/qrUrl';
import { getWardByNo } from '../utils/formatters';
import { PRODUCT_NAME, MUNICIPALITY_DEMO } from '../config/branding';

const steps = [
  'Open your phone camera',
  'Point at the QR code below',
  'Tap the link — view live project data',
];

export default function QrDemo() {
  const { id } = useParams();
  const { projects, wards, dataLoading } = useData();
  const project = projects.find((p) => p.id === id);
  const scanUrl = getProjectScanUrl(id);
  const onLocalhost = isLocalhostUrl();

  if (dataLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center">
        <LoadingSpinner label="Loading QR demo…" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-600">Demo project not found.</p>
        <Link to="/" className="mt-4 text-sm font-semibold text-brand-700">Back to home</Link>
      </div>
    );
  }

  const ward = getWardByNo(wards, project.wardNo);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-50 via-white to-brand-50/30 flex flex-col">
      <header className="page-container py-5 flex items-center justify-between gap-4">
        <BrandLogo to="/" size="sm" />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </header>

      <main className="flex-1 page-container pb-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wide mb-4">
              <ScanLine className="h-3.5 w-3.5" />
              Site QR demo
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
              Scan to view project details
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Like a real sign at a construction site — scan first, then see budget, payments, and proof on your phone.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-6 sm:p-8 card-shadow-lg text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg bg-brand-900 text-white text-xs font-bold">
                Ward {project.wardNo}
              </span>
              {ward && (
                <span className="text-xs text-slate-500 font-medium">{ward.name}</span>
              )}
            </div>

            <p className="text-lg font-bold text-brand-950 leading-snug mb-6">
              {project.title}
            </p>

            <div className="relative inline-block">
              <div className="absolute -inset-3 rounded-2xl bg-brand-100/60" />
              <div className="relative p-5 bg-white border-4 border-brand-900 rounded-2xl shadow-lg">
                <QRCodeSVG value={scanUrl} size={240} level="H" includeMargin />
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
              <Smartphone className="h-4 w-4" />
              Scan with your phone camera
            </div>

            <p className="text-[10px] text-slate-400 mt-3 break-all leading-relaxed px-2">
              {scanUrl}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 card-shadow">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">How it works</p>
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {onLocalhost && (
            <div className="mt-4 flex gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-xs sm:text-sm">
                Testing on this computer? Phones cannot scan localhost. Run{' '}
                <code className="font-mono text-[11px] bg-amber-100 px-1 rounded">npm run dev</code>{' '}
                and set <code className="font-mono text-[11px] bg-amber-100 px-1 rounded">VITE_PUBLIC_URL</code>{' '}
                to your Wi‑Fi IP so the QR opens on your phone.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            {PRODUCT_NAME} · {MUNICIPALITY_DEMO}
          </p>
        </div>
      </main>
    </div>
  );
}
