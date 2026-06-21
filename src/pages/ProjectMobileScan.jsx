import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { PRODUCT_NAME, MUNICIPALITY_DEMO } from '../config/branding';
import {
  Shield, MapPin, HardHat, Wallet, TrendingUp, Receipt,
  Camera, AlertTriangle, ExternalLink, CheckCircle2,
  FolderKanban, WifiOff, RadioTower,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { findViewableProject, isPublicProject } from '../utils/projectVisibility';
import { decodeScanSnapshot } from '../utils/qrUrl';
import { fetchLiveSync } from '../services/liveSyncService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { StatusBadge, RiskLevelBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { formatCurrency, formatDate, getWardByNo } from '../utils/formatters';
import {
  getTotalPaid,
  getBudgetUsedPercent,
  getRiskFlags,
  getRiskLevel,
  calculateTrustScore,
  generateRiskExplanation,
} from '../utils/riskEngine';

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl ${highlight ? 'bg-amber-50 border border-amber-100' : 'bg-white border border-slate-100'}`}>
      <div className={`p-2 rounded-lg shrink-0 ${highlight ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function ProjectMobileScan() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { projects, wards, dataLoading } = useData();
  const { profile } = useAuth();
  const liveProject = findViewableProject(projects, id, profile);

  // Real-time updates on a device with no local data of its own (e.g. a
  // citizen's phone): poll the dev-server live-sync endpoint (see
  // liveSyncService.js / vite.config.js) every few seconds so admin edits
  // made *after* the QR was scanned still show up, without re-scanning.
  // This is the full live project — same shape as `liveProject` — so it's
  // treated identically below, not as a frozen snapshot.
  const [syncedData, setSyncedData] = useState(null);
  useEffect(() => {
    if (liveProject) return undefined;
    let cancelled = false;
    const poll = async () => {
      const fresh = await fetchLiveSync();
      if (!cancelled && fresh) setSyncedData(fresh);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [liveProject, id]);

  const syncedProject = !liveProject
    ? syncedData?.projects?.find((p) => p.id === id && isPublicProject(p)) ?? null
    : null;
  const liveContextProjects = liveProject ? projects : (syncedData?.projects ?? []);
  const isLiveSynced = !liveProject && Boolean(syncedProject);

  // Last-resort fallback for the very first paint on a device that hasn't
  // reached the live-sync endpoint yet (or never will, e.g. a production
  // build with no dev server behind it) — see qrUrl.js for why the QR link
  // carries a precomputed snapshot for exactly this case.
  const snapshot = (liveProject || syncedProject) ? null : decodeScanSnapshot(searchParams.get('d'));
  const isOfflineSnapshot = !liveProject && !syncedProject && Boolean(snapshot);
  const project = liveProject || syncedProject || snapshot;

  if (dataLoading) {
    return (
      <div className="min-h-[100dvh] bg-brand-900 flex items-center justify-center p-6">
        <LoadingSpinner label="Loading project…" className="[&_p]:text-slate-300 [&_div]:border-slate-600 [&_div]:border-t-emerald-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6">
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

  const ward = getWardByNo(wards, project.wardNo);

  let paid; let budgetUsed; let remaining; let flags; let risk; let score; let explanation;
  let paymentCount; let proofCount; let complaintCount; let latestPayment; let latestProofTitle;

  if (isOfflineSnapshot) {
    paid = snapshot.paidAmount ?? 0;
    budgetUsed = snapshot.budgetUsedPercent ?? 0;
    remaining = Math.max(0, (snapshot.allocatedBudget ?? 0) - paid);
    flags = (snapshot.riskFlagLabels ?? []).map((label, i) => ({ id: `flag-${i}`, label }));
    risk = { label: snapshot.riskLabel || 'Not enough public data yet' };
    score = snapshot.riskScore ?? null;
    explanation = snapshot.riskExplanation || '';
    paymentCount = snapshot.paymentCount ?? 0;
    proofCount = snapshot.proofCount ?? 0;
    complaintCount = snapshot.complaintCount ?? 0;
    latestPayment = snapshot.latestPayment ?? null;
    latestProofTitle = snapshot.latestProofTitle ?? null;
  } else {
    const payments = project.payments ?? [];
    const proofs = project.proofs ?? [];
    const complaints = project.complaints ?? [];
    const riskContext = liveContextProjects.length ? liveContextProjects : [project];
    paid = getTotalPaid(project);
    budgetUsed = getBudgetUsedPercent(project);
    remaining = Math.max(0, (project.allocatedBudget ?? 0) - paid);
    flags = getRiskFlags(project, riskContext);
    risk = getRiskLevel(project, riskContext);
    score = calculateTrustScore(project, riskContext);
    explanation = generateRiskExplanation(project, riskContext);
    paymentCount = payments.length;
    proofCount = proofs.length;
    complaintCount = complaints.length;
    latestPayment = payments.length
      ? [...payments].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;
    latestProofTitle = proofs.length ? proofs[proofs.length - 1].title : null;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-brand-900 via-brand-900 to-slate-900 text-white">
      {/* Top bar */}
      <header className="px-4 pt-5 pb-4 safe-area-top">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-bold tracking-tight">{PRODUCT_NAME}</span>
          <span className="text-xs text-brand-300 ml-auto">Site scan</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold">Ward {project.wardNo}</span>
          <StatusBadge status={project.status} />
        </div>
        <h1 className="text-xl font-extrabold leading-tight tracking-tight">{project.title}</h1>
        {ward && (
          <p className="flex items-center gap-1.5 text-xs text-brand-200 mt-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {ward.name} · {project.location}
          </p>
        )}
        {isLiveSynced && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-300 mt-2">
            <RadioTower className="h-3.5 w-3.5 shrink-0 animate-pulse" />
            Live — updates automatically as the ward office publishes changes
          </p>
        )}
        {isOfflineSnapshot && (
          <p className="flex items-center gap-1.5 text-xs text-amber-300 mt-2">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            Snapshot captured {formatDate(snapshot.snapshotAt)} — may not reflect the latest updates
          </p>
        )}
      </header>

      {/* Content cards */}
      <main className="px-4 pb-8 space-y-3 -mt-1">
        <div className="rounded-2xl bg-white text-slate-900 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Physical progress</p>
            <span className="text-lg font-black text-brand-700">{project.progressPercent}%</span>
          </div>
          <ProgressBar value={project.progressPercent} size="lg" showLabel={false} />
          <p className="text-xs text-slate-500 mt-2">
            Deadline: {formatDate(project.deadline)} · Started {formatDate(project.startDate)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InfoRow icon={Wallet} label="Allocated" value={formatCurrency(project.allocatedBudget)} />
          <InfoRow icon={Receipt} label="Paid so far" value={formatCurrency(paid)} />
          <InfoRow icon={TrendingUp} label="Budget used" value={`${budgetUsed}%`} />
          <InfoRow icon={Wallet} label="Remaining" value={formatCurrency(remaining)} />
        </div>

        <InfoRow
          icon={HardHat}
          label="Contractor"
          value={project.contractorName || 'Not yet assigned'}
        />

        <div className="rounded-2xl bg-white text-slate-900 p-4 shadow-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tender & records</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Tender amount</dt>
              <dd className="font-bold">{formatCurrency(project.tenderAmount)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Payment releases</dt>
              <dd className="font-bold">{paymentCount}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Proof uploads</dt>
              <dd className="font-bold">{proofCount}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Citizen feedback</dt>
              <dd className="font-bold">{complaintCount}</dd>
            </div>
          </dl>
        </div>

        <div className={`rounded-2xl p-4 shadow-xl ${flags.length ? 'bg-amber-50 border border-amber-200 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950'}`}>
          <div className="flex items-center gap-2 mb-2">
            {flags.length ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            )}
            <RiskLevelBadge level={risk.label} />
            <span className="text-xs font-bold text-slate-600 ml-auto">Score {score}/100</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{explanation}</p>
          {flags.length > 0 && (
            <ul className="mt-3 space-y-1">
              {flags.slice(0, 3).map((f) => (
                <li key={f.id} className="text-xs font-medium flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {f.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {latestPayment && (
          <div className="rounded-2xl bg-white text-slate-900 p-4 shadow-xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Latest payment</p>
            <p className="text-sm font-bold">{formatCurrency(latestPayment.amount)}</p>
            <p className="text-xs text-slate-600 mt-1">{latestPayment.milestone}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(latestPayment.date)}</p>
          </div>
        )}

        {latestProofTitle && (
          <div className="rounded-2xl bg-white text-slate-900 p-4 shadow-xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Latest proof
            </p>
            <p className="text-sm font-medium">{latestProofTitle}</p>
          </div>
        )}

        <p className="text-xs text-center text-brand-300/80 px-4 leading-relaxed">
          Public transparency record · {MUNICIPALITY_DEMO} · Not a legal certificate
        </p>

        {Boolean(liveProject) && (
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/10 border border-white/20 text-sm font-semibold text-white active:bg-white/20"
          >
            View full project page
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </main>
    </div>
  );
}
