import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { getCitizenDisplayName, getComplaintCategoryLabel } from '../services/complaintService';
import {
  ArrowLeft, MapPin, User, MessageSquareWarning, Shield, Bookmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { findViewableProject, getPublicProjects } from '../utils/projectVisibility';
import Button from '../components/ui/Button';
import { ROLES } from '../services/authService';
import { isProjectBookmarked, toggleProjectBookmark } from '../services/bookmarkService';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge, RiskLevelBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { RiskFlagList } from '../components/ui/RiskFlag';
import PaymentTable from '../components/project/PaymentTable';
import ProofGallery from '../components/project/ProofGallery';
import QRCodePanel from '../components/project/QRCodePanel';
import BudgetOverview from '../components/project/BudgetOverview';
import ContractorSection from '../components/project/ContractorSection';
import AISummaryPanel from '../components/project/AISummaryPanel';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, formatCurrency, getWardByNo } from '../utils/formatters';
import {
  getRiskFlags,
  getRiskLevel,
  getTotalPaid,
  getBudgetUsedPercent,
  generateRiskExplanation,
} from '../utils/riskEngine';

function SectionHeading({ number, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white text-sm font-bold">
        {number}
      </span>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-brand-950">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { projects, wards, dataLoading } = useData();
  const isPublicCitizen = profile?.role === ROLES.PUBLIC;
  const [bookmarkTick, setBookmarkTick] = useState(0);
  const project = findViewableProject(projects, id, profile);

  const isSaved = profile?.uid && id && bookmarkTick >= 0
    ? isProjectBookmarked(profile.uid, id)
    : false;

  const handleToggleBookmark = () => {
    if (!profile?.uid || !id) return;
    toggleProjectBookmark(profile.uid, id);
    setBookmarkTick((n) => n + 1);
  };

  if (dataLoading) {
    return (
      <div className="min-h-[60vh] dashboard-bg flex items-center justify-center">
        <LoadingSpinner label="Loading project…" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 dashboard-bg">
        <EmptyState
          title="Project not found"
          description="This project may not be published yet or may have been removed."
          actionLabel="View Public Dashboard"
          actionTo="/dashboard"
        />
      </div>
    );
  }

  const ward = getWardByNo(wards, project.wardNo);
  const publishedProjects = getPublicProjects(projects);
  const flags = getRiskFlags(project, publishedProjects);
  const riskLevel = getRiskLevel(project, publishedProjects);
  const riskExplanation = generateRiskExplanation(project, publishedProjects);
  const totalPaid = getTotalPaid(project);
  const budgetUsed = getBudgetUsedPercent(project);
  const remaining = Math.max(0, (project.allocatedBudget ?? 0) - totalPaid);
  const complaints = project.complaints ?? [];
  const proofs = project.proofs ?? [];
  const payments = project.payments ?? [];

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="page-container py-6 sm:py-8 space-y-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 card-shadow">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-900 text-white text-sm font-bold">
              Ward {project.wardNo}
            </span>
            <StatusBadge status={project.status} />
            <RiskLevelBadge level={riskLevel.label} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 leading-tight">{project.title}</h1>
          {ward && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {ward.name} · {project.location}
            </p>
          )}
          {isPublicCitizen && profile?.uid && (
            <Button
              type="button"
              variant={isSaved ? 'primary' : 'secondary'}
              size="sm"
              icon={Bookmark}
              onClick={handleToggleBookmark}
              className="mt-4"
            >
              {isSaved ? 'Saved to profile' : 'Save project'}
            </Button>
          )}
        </div>

        <div className={`rounded-2xl border-2 p-5 sm:p-6 card-shadow ${
          riskLevel.label === 'High Risk'
            ? 'border-red-200 bg-red-50/40'
            : riskLevel.label === 'Medium Risk'
              ? 'border-amber-200 bg-amber-50/40'
              : 'border-emerald-200 bg-emerald-50/40'
        }`}>
          <p className="text-base sm:text-lg text-brand-950 leading-relaxed font-medium">
            This project has{' '}
            <span className="font-bold">{formatCurrency(project.allocatedBudget)}</span> budget,{' '}
            <span className="font-bold">{formatCurrency(totalPaid)}</span> payment released,{' '}
            <span className="font-bold">{project.progressPercent}%</span> progress, and{' '}
            <span className={`font-bold ${
              riskLevel.label === 'High Risk' ? 'text-red-700' :
              riskLevel.label === 'Medium Risk' ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {riskLevel.label}
            </span>.
          </p>
          <div className="mt-4 max-w-md">
            <ProgressBar value={project.progressPercent} showLabel={false} size="lg" />
          </div>
        </div>

        <section>
          <SectionHeading number="1" title="Budget and Tender" subtitle="Official allocation and tender details" />
          <BudgetOverview
            project={project}
            totalPaid={totalPaid}
            budgetUsed={budgetUsed}
            remaining={remaining}
          />
        </section>

        <section>
          <SectionHeading number="2" title="Contractor" subtitle="Who is carrying out this ward work" />
          <ContractorSection project={project} />
        </section>

        <section>
          <SectionHeading number="3" title="Payment Updates" subtitle={`${payments.length} payment record(s) published`} />
          <Card padding={false}>
            <PaymentTable payments={payments} proofs={proofs} />
          </Card>
        </section>

        <section>
          <SectionHeading number="4" title="Proof Photos / Documents" subtitle="Site photos and official documents" />
          <Card>
            <ProofGallery proofs={proofs} />
          </Card>
        </section>

        <section>
          <SectionHeading number="5" title="Citizen Complaints" subtitle="Public feedback linked to this project" />
          <Card padding={false}>
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                <MessageSquareWarning className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                No public complaints submitted for this project yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.map((c, i) => (
                  <div key={`${c.createdAt}-${i}`} className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-slate-500">{getComplaintCategoryLabel(c.category)}</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
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
              <Link to={`/complaints?project=${project.id}`} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Submit public feedback →
              </Link>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading number="6" title="Ward Mitra AI Explanation" subtitle="Plain-language summary of this project" />
          <AISummaryPanel project={project} />
        </section>

        <section>
          <SectionHeading number="7" title="QR Scan Board" subtitle="Scan at the project site to view live details" />
          <QRCodePanel projectId={project.id} />
        </section>

        {flags.length > 0 && (
          <Card className="border-amber-200/80">
            <CardHeader
              title="Verification notes"
              subtitle={`${flags.length} item(s) flagged for review`}
            />
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{riskExplanation}</p>
            <RiskFlagList flags={flags} />
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Flags help citizens and officials spot records that may need verification.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
