import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy, Check, Printer, ExternalLink, Smartphone, Wifi, ScanLine,
} from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import {
  getProjectScanUrl,
  getProjectPublicUrl,
  isLocalhostUrl,
} from '../../utils/qrUrl';

export { getProjectScanUrl, getProjectPublicUrl } from '../../utils/qrUrl';

export default function QRCodePanel({ projectId, project = null, allProjects }) {
  // Embed a snapshot when the live project is available so the QR still
  // works on a phone that has never loaded this app (see qrUrl.js). This
  // makes the real link long (it carries the project data), so we keep a
  // short, bare version around just for what gets printed on screen as text
  // — nobody needs to read a wall of base64.
  const scanUrl = getProjectScanUrl(projectId, project, allProjects);
  const displayUrl = getProjectScanUrl(projectId);
  const fullUrl = getProjectPublicUrl(projectId);
  const localhostWarning = isLocalhostUrl();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl border border-brand-200/60 bg-gradient-to-br from-white via-brand-50/30 to-emerald-50/40 overflow-hidden shadow-lg shadow-brand-900/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent pointer-events-none" />
      <div className="h-1.5 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500" />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-700 to-emerald-600 text-white shadow-md">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Scan at project site</h3>
            <p className="text-xs text-slate-500 mt-0.5">Open this page on your phone to see live project details</p>
          </div>
        </div>

        {localhostWarning && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-left">
            <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 shrink-0" />
              Phone scan tip: use Network URL
            </p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Open the <strong>Network</strong> URL from your terminal on PC first, then scan. Same Wi‑Fi required.
            </p>
          </div>
        )}

        {/* QR showcase */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute -inset-3 bg-gradient-to-br from-brand-400/30 to-emerald-400/30 rounded-3xl blur-xl" />
            <div className="relative p-2 rounded-2xl bg-gradient-to-br from-brand-800 to-emerald-700 shadow-xl">
              <div className="p-4 bg-white rounded-xl">
                {/* level="M" (not "H") — the embedded data snapshot already
                    makes this QR dense; a lower error-correction level keeps
                    the module grid coarse enough for a phone camera to read
                    reliably off a lit screen. */}
                <QRCodeSVG value={scanUrl} size={168} level="M" includeMargin />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full mb-3 border border-emerald-200/60">
            <Smartphone className="h-3.5 w-3.5" />
            Opens mobile citizen view
          </div>

          <p className="text-sm text-slate-600 text-center leading-relaxed max-w-[280px]">
            Citizens scan this at the construction site to instantly view budget, contractor, payments, proofs, risk flags, and complaints.
          </p>

          <p className="text-xs text-slate-400 mt-3 break-all max-w-[260px] font-mono text-center leading-relaxed">{displayUrl}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2 mt-6">
          <Button
            variant="primary"
            size="sm"
            icon={copied ? Check : Copy}
            className="w-full shadow-md"
            onClick={handleCopy}
          >
            {copied ? 'Link copied!' : 'Copy Public Link'}
          </Button>
          <Link to={`/projects/${projectId}/qr-board`} className="w-full">
            <Button variant="emerald" size="sm" icon={Printer} className="w-full">
              Print Site QR Board
            </Button>
          </Link>
          <a href={scanUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="secondary" size="sm" icon={Smartphone} className="w-full">
              Preview on mobile
            </Button>
          </a>
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="ghost" size="sm" icon={ExternalLink} className="w-full text-slate-500">
              Full project page
            </Button>
          </a>
        </div>
      </div>

      <div id={`qr-export-${projectId}`} className="hidden" aria-hidden>
        <QRCodeSVG value={scanUrl} size={512} level="M" includeMargin />
      </div>
    </div>
  );
}

export function QRCodeBanner({ projectId, project = null, allProjects }) {
  const scanUrl = getProjectScanUrl(projectId, project, allProjects);
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-100">
      <div className="p-2 bg-white rounded-lg border border-brand-100 shrink-0 shadow-sm">
        <QRCodeSVG value={scanUrl} size={56} level="M" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-brand-900">Scan at Project Site</p>
        <p className="text-xs text-brand-600/80 truncate mt-0.5">{scanUrl}</p>
      </div>
    </div>
  );
}
