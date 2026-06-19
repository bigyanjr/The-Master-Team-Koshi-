import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Building, ArrowLeft, Banknote, User, HardHat } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge, RiskLevelBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import TrustScoreRing from '../components/ui/TrustScoreRing';
import { RiskFlagList } from '../components/ui/RiskFlag';
import PaymentTable from '../components/project/PaymentTable';
import ProofGallery from '../components/project/ProofGallery';
import ProjectTimeline from '../components/project/ProjectTimeline';
import QRCodePanel from '../components/project/QRCodePanel';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate, getWardByNo } from '../utils/formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
  getProjectHealth,
  getTotalPaid,
  getBudgetUsedPercent,
} from '../utils/riskEngine';

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, wards } = useData();

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState title="Project not found" description="This project may have been removed or the link is incorrect." />
        <div className="text-center mt-4">
          <Link to="/projects" className="text-brand-700 text-sm font-medium hover:underline">← Back to projects</Link>
        </div>
      </div>
    );
  }

  const ward = getWardByNo(wards, project.wardNo);
  const health = getProjectHealth(project);
  const trustScore = calculateTrustScore(project);
  const flags = getRiskFlags(project);
  const riskLevel = getRiskLevel(project);
  const totalPaid = getTotalPaid(project);
  const budgetUsed = getBudgetUsedPercent(project);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <StatusBadge status={project.status} />
              <RiskLevelBadge level={riskLevel.label} />
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{project.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-slate-600 mt-2 leading-relaxed">{project.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{project.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Building className="h-3 w-3" /> Ward</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">Ward {ward?.number} — {ward?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> Timeline</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{formatDate(project.startDate)} — {formatDate(project.deadline)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Banknote className="h-3 w-3" /> Budget</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{formatCurrency(project.allocatedBudget)}</p>
              </div>
            </div>

            <ProgressBar value={project.progressPercent} size="lg" className="mt-6" />

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
              {health.summary}
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <CardHeader
                title="Payment Records"
                subtitle={`${formatCurrency(totalPaid)} released (${budgetUsed}%) of ${formatCurrency(project.allocatedBudget)}`}
                className="!mb-0"
              />
            </div>
            <PaymentTable payments={project.payments ?? []} />
          </Card>

          <Card>
            <CardHeader title="Proof Documents" subtitle={`${(project.proofs ?? []).length} uploads — before, during, after, documents`} />
            <ProofGallery proofs={project.proofs ?? []} />
          </Card>

          <Card>
            <CardHeader title="Activity Timeline" subtitle="Payments and proof uploads chronologically" />
            <ProjectTimeline payments={project.payments ?? []} proofs={project.proofs ?? []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center py-2">
              <TrustScoreRing score={trustScore} size="lg" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <p className="text-slate-400">Budget Used</p>
                <p className="font-bold text-slate-800">{budgetUsed}%</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <p className="text-slate-400">Complaints</p>
                <p className="font-bold text-slate-800">{health.complaintCount}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Risk Flags</h4>
              <RiskFlagList flags={flags} />
            </div>
          </Card>

          <QRCodePanel projectId={project.id} projectTitle={project.title} />

          {project.contractorName && (
            <Card>
              <CardHeader title="Contractor" />
              <div className="flex items-start gap-3 text-sm">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-700">
                  <HardHat className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{project.contractorName}</p>
                  <p className="text-slate-500 mt-1">Tender: {formatCurrency(project.tenderAmount)}</p>
                  {project.tenderAmount > project.allocatedBudget && (
                    <p className="text-xs text-red-600 font-medium mt-1">Exceeds allocated budget</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {(project.complaints ?? []).length > 0 && (
            <Card>
              <CardHeader title="Citizen Complaints" subtitle={`${project.complaints.length} filed`} />
              <div className="space-y-2">
                {project.complaints.map((c, i) => (
                  <div key={`${c.createdAt}-${i}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-slate-700">{c.message}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" /> {c.citizenName}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
