import { useParams, Link } from 'react-router-dom';
import { getCitizenDisplayName, getComplaintCategoryLabel } from '../services/complaintService';
import {
  ArrowLeft, MapPin, User, MessageSquareWarning, Shield, AlertTriangle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge, RiskLevelBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import TrustScoreRing from '../components/ui/TrustScoreRing';
import { RiskFlagList } from '../components/ui/RiskFlag';
import PaymentTable from '../components/project/PaymentTable';
import ProofGallery from '../components/project/ProofGallery';
import ProjectLifecycleTimeline from '../components/project/ProjectLifecycleTimeline';
import QRCodePanel from '../components/project/QRCodePanel';
import BudgetOverview from '../components/project/BudgetOverview';
import ContractorSection from '../components/project/ContractorSection';
import CitizenExplanationPanel from '../components/project/CitizenExplanationPanel';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, getWardByNo } from '../utils/formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
  getTotalPaid,
  getBudgetUsedPercent,
} from '../utils/riskEngine';

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, wards } = useData();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <EmptyState title="Project not found" description="This project may have been removed or the link is incorrect." />
        <Link to="/projects" className="mt-4 text-brand-700 text-sm font-medium hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>
    );
  }

  const ward = getWardByNo(wards, project.wardNo);
  const trustScore = calculateTrustScore(project);
  const flags = getRiskFlags(project);
  const riskLevel = getRiskLevel(project);
  const totalPaid = getTotalPaid(project);
  const budgetUsed = getBudgetUsedPercent(project);
  const remaining = Math.max(0, (project.allocatedBudget ?? 0) - totalPaid);
  const complaints = project.complaints ?? [];
  const proofs = project.proofs ?? [];
  const payments = project.payments ?? [];

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Projects
        </Link>

        {/* ── 1. Project Header ── */}
        <section className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden card-shadow-lg">
          <div className={`h-2 bg-gradient-to-r ${
            riskLevel.label === 'High Risk' ? 'from-red-500 via-red-400 to-amber-400' :
            riskLevel.label === 'Medium Risk' ? 'from-amber-400 via-amber-300 to-emerald-400' :
            'from-brand-600 via-emerald-500 to-teal-400'
          }`} />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-900 text-white text-sm font-bold">
                    Ward {project.wardNo}
                  </span>
                  <StatusBadge status={project.status} />
                  <RiskLevelBadge level={riskLevel.label} />
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {project.title}
                </h1>

                {ward && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {ward.name} · {project.location}
                  </p>
                )}

                <p className="text-slate-600 mt-4 leading-relaxed max-w-3xl">{project.description}</p>

                <div className="mt-6 max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Physical Progress</span>
                    <span className="font-bold text-brand-700">{project.progressPercent}%</span>
                  </div>
                  <ProgressBar value={project.progressPercent} showLabel={false} size="lg" />
                </div>
              </div>

              {/* Trust score panel */}
              <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/50 border border-slate-200/80 shrink-0 lg:min-w-[200px]">
                <TrustScoreRing score={trustScore} size="lg" />
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <Shield className="h-3.5 w-3.5" />
                  Transparency Trust Score
                </div>
                {flags.length > 0 && (
                  <p className="text-xs text-amber-700 font-medium mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {flags.length} active risk flag{flags.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Budget Overview ── */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Budget Overview</h2>
          <BudgetOverview
            project={project}
            totalPaid={totalPaid}
            budgetUsed={budgetUsed}
            remaining={remaining}
          />
        </section>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            {/* ── 3. Lifecycle Timeline ── */}
            <Card>
              <CardHeader
                title="Project Timeline"
                subtitle="From budget allocation to completion or delay"
              />
              <ProjectLifecycleTimeline project={project} />
            </Card>

            {/* ── 4. Contractor ── */}
            <ContractorSection project={project} />

            {/* ── 5. Payment History ── */}
            <Card padding={false}>
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <CardHeader
                  title="Payment History"
                  subtitle={`${payments.length} release(s) · ${budgetUsed}% of budget paid`}
                  className="!mb-0"
                />
              </div>
              <PaymentTable payments={payments} proofs={proofs} />
            </Card>

            {/* ── 6. Proof Gallery ── */}
            <Card>
              <CardHeader
                title="Proof Gallery"
                subtitle="Before, during, after photos and official documents"
              />
              <ProofGallery proofs={proofs} />
            </Card>

            {/* ── 10. AI Citizen Explanation ── */}
            <CitizenExplanationPanel project={project} />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* ── 9. QR Code ── */}
            <QRCodePanel projectId={project.id} projectTitle={project.title} />

            {/* ── 7. Risk Flags ── */}
            <Card className={flags.length > 0 ? 'border-amber-200/80' : ''}>
              <CardHeader
                title="Risk Flags"
                subtitle={flags.length ? `${flags.length} concern(s) detected` : 'All checks passed'}
              />
              <RiskFlagList flags={flags} />
            </Card>

            {/* ── 8. Citizen Complaints ── */}
            <Card padding={false}>
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <CardHeader
                  title="Citizen Complaints"
                  subtitle={`${complaints.length} report(s) filed publicly`}
                  className="!mb-0"
                />
              </div>
              {complaints.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  <MessageSquareWarning className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  No complaints filed for this project.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {complaints.map((c, i) => (
                    <div key={`${c.createdAt}-${i}`} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={c.status} />
                          <span className="text-xs text-slate-500">{getComplaintCategoryLabel(c.category)}</span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{c.message}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                        <User className="h-3 w-3" /> {getCitizenDisplayName(c.citizenName)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Link to="/complaints" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                  File a complaint →
                </Link>
              </div>
            </Card>

            {/* Quick meta */}
            <Card>
              <CardHeader title="Project Info" />
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Start Date</dt>
                  <dd className="font-medium text-slate-800">{formatDate(project.startDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Deadline</dt>
                  <dd className="font-medium text-slate-800">{formatDate(project.deadline)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Proofs Uploaded</dt>
                  <dd className="font-medium text-slate-800">{proofs.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Payments</dt>
                  <dd className="font-medium text-slate-800">{payments.length}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
