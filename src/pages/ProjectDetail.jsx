import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Building, ArrowLeft, IndianRupee, User,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import TrustScoreRing from '../components/ui/TrustScoreRing';
import { RiskFlagList } from '../components/ui/RiskFlag';
import PaymentTable from '../components/project/PaymentTable';
import ProofGallery from '../components/project/ProofGallery';
import ProjectTimeline from '../components/project/ProjectTimeline';
import QRCodePanel from '../components/project/QRCodePanel';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateTrustScore, getRiskFlags } from '../utils/riskEngine';

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, wards, contractors, tenders, payments, proofs, updates, complaints } = useData();

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

  const ward = wards.find((w) => w.id === project.wardId);
  const contractor = contractors.find((c) => c.id === project.contractorId);
  const tender = tenders.find((t) => t.id === project.tenderId);
  const projectPayments = payments.filter((p) => p.projectId === project.id);
  const projectProofs = proofs.filter((p) => p.projectId === project.id);
  const projectUpdates = updates.filter((u) => u.projectId === project.id);
  const projectComplaints = complaints.filter((c) => c.projectId === project.id);

  const context = { payments, proofs, updates, complaints, contractors };
  const trustScore = calculateTrustScore(project, context);
  const flags = getRiskFlags(project, context);
  const totalPaid = projectPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <StatusBadge status={project.status} />
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
                <p className="text-sm font-medium text-slate-800 mt-0.5">{formatDate(project.startDate)} — {formatDate(project.expectedEndDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Budget</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{formatCurrency(project.budget)}</p>
              </div>
            </div>

            <ProgressBar value={project.progress} size="lg" className="mt-6" />
          </Card>

          {/* Payments */}
          <Card padding={false}>
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <CardHeader title="Payment Records" subtitle={`${formatCurrency(totalPaid)} released of ${formatCurrency(project.budget)}`} className="!mb-0" />
            </div>
            <PaymentTable payments={projectPayments} />
          </Card>

          {/* Proofs */}
          <Card>
            <CardHeader title="Proof Documents" subtitle="Photos and verification records" />
            <ProofGallery proofs={projectProofs} />
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Progress Timeline" subtitle={`${projectUpdates.length} updates posted`} />
            <ProjectTimeline updates={projectUpdates} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center py-2">
              <TrustScoreRing score={trustScore} size="lg" />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Risk Flags</h4>
              <RiskFlagList flags={flags} />
            </div>
          </Card>

          <QRCodePanel projectId={project.id} projectTitle={project.title} />

          {contractor && (
            <Card>
              <CardHeader title="Contractor" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">{contractor.name}</p>
                <p className="text-slate-500 font-mono text-xs">GSTIN: {contractor.gstin}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${contractor.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {contractor.verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className="text-xs text-slate-500">★ {contractor.rating}</span>
                </div>
              </div>
            </Card>
          )}

          {tender && (
            <Card>
              <CardHeader title="Tender Details" />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tender No.</dt>
                  <dd className="font-mono text-xs text-slate-800">{tender.tenderNo}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Published</dt>
                  <dd className="text-slate-800">{formatDate(tender.publishedDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Bids Received</dt>
                  <dd className="text-slate-800">{tender.bidsReceived}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Est. Value</dt>
                  <dd className="font-semibold text-slate-800">{formatCurrency(tender.estimatedValue)}</dd>
                </div>
              </dl>
            </Card>
          )}

          {projectComplaints.length > 0 && (
            <Card>
              <CardHeader title="Related Complaints" subtitle={`${projectComplaints.length} filed`} />
              <div className="space-y-2">
                {projectComplaints.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-slate-400">{formatDate(c.date)}</span>
                    </div>
                    <p className="font-medium text-slate-800">{c.subject}</p>
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
