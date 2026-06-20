import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { getCitizenDisplayName, getComplaintCategoryLabel } from '../services/complaintService';
import {
  ArrowLeft, MapPin, User, MessageSquareWarning, Bookmark, Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { findViewableProject, getPublicProjects } from '../utils/projectVisibility';
import Button from '../components/ui/Button';
import { ROLES } from '../services/authService';
import { isProjectBookmarked, toggleProjectBookmark } from '../services/bookmarkService';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { RiskFlagList } from '../components/ui/RiskFlag';
import PaymentTable from '../components/project/PaymentTable';
import ProofGallery from '../components/project/ProofGallery';
import QRCodePanel from '../components/project/QRCodePanel';
import BudgetOverview from '../components/project/BudgetOverview';
import ContractorSection from '../components/project/ContractorSection';
import AISummaryPanel from '../components/project/AISummaryPanel';
import MoneyFlowDiagram from '../components/transparency/MoneyFlowDiagram';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, formatCurrency, getWardByNo } from '../utils/formatters';
import {
  getRiskFlags,
  getTotalPaid,
  getBudgetUsedPercent,
  hasEnoughRiskData,
  INSUFFICIENT_RISK_DATA_LABEL,
} from '../utils/riskEngine';

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg sm:text-xl font-bold text-brand-950 dark:text-slate-50">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { projects, wards, dataLoading } = useData();
  const { t } = useLanguage();
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
          actionLabel="Back to spending"
          actionTo="/dashboard"
        />
      </div>
    );
  }

  const ward = getWardByNo(wards, project.wardNo);
  const publishedProjects = getPublicProjects(projects);
  const flags = hasEnoughRiskData(project) ? getRiskFlags(project, publishedProjects) : [];
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
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors dark:text-slate-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('pd.backToProjects')}
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 card-shadow dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-brand-900 text-white text-sm font-bold">
              Ward {project.wardNo}
            </span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 leading-tight dark:text-slate-50">{project.title}</h1>
          {ward && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-2 dark:text-slate-400">
              <MapPin className="h-4 w-4 shrink-0" />
              {ward.name} · {project.location}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {isPublicCitizen && profile?.uid && (
              <Button
                type="button"
                variant={isSaved ? 'primary' : 'secondary'}
                size="sm"
                icon={Bookmark}
                onClick={handleToggleBookmark}
              >
                {isSaved ? t('pd.saved') : t('pd.saveProject')}
              </Button>
            )}
            <Link to="/ask">
              <Button variant="secondary" size="sm" icon={Bot}>{t('nav.ask')}</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-blue-50/40 p-5 sm:p-6 card-shadow dark:bg-slate-900 dark:border-slate-800">
          <p className="text-base sm:text-lg text-brand-950 leading-relaxed dark:text-slate-200">
            <span className="font-bold dark:text-red-400">{formatCurrency(project.allocatedBudget)}</span> budget set aside ·{' '}
            <span className="font-bold dark:text-red-400">{formatCurrency(totalPaid)}</span> paid so far ·{' '}
            <span className="font-bold dark:text-red-400">{project.progressPercent}%</span> work done
          </p>
          <div className="mt-4 max-w-md">
            <ProgressBar value={project.progressPercent} showLabel={false} size="lg" />
          </div>
        </div>

        <section>
          <SectionHeading title={t('pd.scanTitle')} subtitle="Use your phone to open this project's public record" />
          <QRCodePanel projectId={project.id} />
        </section>

        <MoneyFlowDiagram compact />

        <section>
          <SectionHeading title={t('pd.budgetPayments')} subtitle="How much was set aside and what has been paid" />
          <BudgetOverview
            project={project}
            totalPaid={totalPaid}
            budgetUsed={budgetUsed}
            remaining={remaining}
          />
          <Card padding={false} className="mt-4">
            <PaymentTable payments={payments} proofs={proofs} />
          </Card>
        </section>

        <section>
          <SectionHeading title={t('pd.whoIsWorking')} subtitle="Contractor and work details" />
          <ContractorSection project={project} />
        </section>

        <section>
          <SectionHeading title={t('pd.proofPhotos')} subtitle="Site photos posted by the ward office" />
          <Card>
            <ProofGallery proofs={proofs} />
          </Card>
        </section>

        <section>
          <SectionHeading title={t('pd.citizenFeedback')} subtitle="What people have shared about this project" />
          <Card padding={false}>
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <MessageSquareWarning className="h-8 w-8 mx-auto text-slate-300 mb-2 dark:text-slate-600" />
                {t('pd.noFeedback')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c, i) => (
                  <div key={`${c.createdAt}-${i}`} className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{getComplaintCategoryLabel(c.category)}</span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed dark:text-slate-300">{c.message}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-2 dark:text-slate-400">
                      <User className="h-3 w-3" /> {getCitizenDisplayName(c.citizenName)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
              <Link to={`/complaints?project=${project.id}`} className="text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-emerald-400 dark:hover:text-emerald-300">
                {t('pd.shareFeedbackLink')}
              </Link>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading title={t('pd.simpleSummary')} subtitle="Ward Mitra explains this project in plain words" />
          <AISummaryPanel project={project} />
        </section>

        {flags.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader
              title={t('pd.doubleCheck')}
              subtitle="Records that may need a closer look"
            />
            <RiskFlagList flags={flags} />
            <p className="text-xs text-slate-500 mt-3 dark:text-slate-400">
              These notes help citizens and ward staff spot missing proof or incomplete records — not legal findings.
            </p>
          </Card>
        )}

        {!hasEnoughRiskData(project) && (
          <p className="text-sm text-slate-500 text-center py-2 dark:text-slate-400">
            {INSUFFICIENT_RISK_DATA_LABEL}. More details will appear as payments and proof are published.
          </p>
        )}
      </div>
    </div>
  );
}
