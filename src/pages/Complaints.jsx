import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageSquareHeart, Send, CheckCircle, Info, Shield,
  FolderKanban, Calendar, Tag, User, FileText,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { FieldError, inputClass } from '../components/admin/FormSection';
import {
  EMPTY_COMPLAINT_FORM,
  COMPLAINT_CATEGORIES,
  validateComplaintForm,
  getComplaintCategoryLabel,
  getCitizenDisplayName,
} from '../services/complaintService';
import FileUpload from '../components/ui/FileUpload';
import { resolveFileUrl, resolveFileName, isImageFileType } from '../services/uploadService';
import { formatDate, getWardByNo } from '../utils/formatters';
import { getAllComplaints } from '../utils/riskEngine';

function CivicNotice() {
  return (
    <div className="flex gap-3 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-blue-50/40">
      <Info className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-slate-800">How citizen feedback works</p>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          Citizen feedback is treated as public concern, not final proof. Ward officials must review
          and verify each complaint before it informs project accountability records.
        </p>
      </div>
    </div>
  );
}

function ComplaintCard({ complaint, project, ward }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 card-shadow hover:border-slate-300/80 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            <Tag className="h-3 w-3" />
            {getComplaintCategoryLabel(complaint.category)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0">
          <Calendar className="h-3 w-3" />
          {formatDate(complaint.createdAt)}
        </span>
      </div>

      {project && (
        <Link
          to={`/projects/${complaint.projectId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline mb-2"
        >
          <FolderKanban className="h-3.5 w-3.5 shrink-0" />
          {project.title}
        </Link>
      )}

      <p className="text-sm text-slate-700 leading-relaxed">{complaint.message}</p>

      {resolveFileUrl(complaint) && (
        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Attached evidence
          </p>
          {isImageFileType(complaint.evidence?.fileType) || resolveFileUrl(complaint)?.startsWith('data:image') ? (
            <a href={resolveFileUrl(complaint)} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={resolveFileUrl(complaint)}
                alt={resolveFileName(complaint) || 'Evidence'}
                className="max-h-40 rounded-md border border-slate-200 object-cover"
              />
            </a>
          ) : (
            <a
              href={resolveFileUrl(complaint)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
            >
              <FileText className="h-3.5 w-3.5" />
              {resolveFileName(complaint) || 'View evidence'}
            </a>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <User className="h-3 w-3" />
          {getCitizenDisplayName(complaint.citizenName)}
        </span>
        {ward && <span>Ward {ward.number} — {ward.name}</span>}
      </div>
    </article>
  );
}

export default function Complaints() {
  const { projects, wards, addComplaint } = useData();
  const { profile, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    ...EMPTY_COMPLAINT_FORM,
    projectId: searchParams.get('project') || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const displayForm = useMemo(() => {
    if (!profile) return form;
    return {
      ...form,
      citizenName: form.citizenName || profile.fullName || '',
      email: form.email || profile.email || '',
      phone: form.phone || profile.phone || '',
    };
  }, [form, profile]);

  const complaints = useMemo(
    () => getAllComplaints(projects).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [projects],
  );

  const verifiedCount = complaints.filter((c) =>
    ['Verified', 'Resolved', 'Under Review'].includes(c.status),
  ).length;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleEvidenceChange = (file) => {
    update('evidenceFile', file);
    if (errors.evidence) setErrors((prev) => ({ ...prev, evidence: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateComplaintForm(displayForm);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await addComplaint({
        ...displayForm,
        submittedByUid: profile?.uid || null,
      });
      setSubmitted(true);
      setForm({
        ...EMPTY_COMPLAINT_FORM,
        projectId: form.projectId,
        ...(profile ? {
          citizenName: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phone || '',
        } : {}),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-bg min-h-screen">
    <div className="page-container py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4">
          <Shield className="h-3.5 w-3.5" />
          Civic participation
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Citizen Feedback for Itahari Projects
        </h1>
        <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Share concerns about Itahari ward projects openly. Your voice helps keep public spending accountable
          — every submission is reviewed by ward officials.
        </p>
      </div>

      <div className="mb-8">
        <CivicNotice />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden card-shadow-lg sticky top-24 flex flex-col max-h-[calc(100vh-6.5rem)]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-brand-50/80 to-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                  <MessageSquareHeart className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Share your concern</h2>
                  <p className="text-xs text-slate-500 mt-0.5">All fields marked * are required</p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5 sm:p-6 overscroll-contain">
              {submitted ? (
                <div className="text-center py-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Thank you for participating</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Your feedback has been submitted for review. It will appear as public feedback
                    after verification.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6 w-full sm:w-auto"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit another concern
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 mb-1">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="projectId"
                      value={form.projectId}
                      onChange={(e) => update('projectId', e.target.value)}
                      className={inputClass(errors.projectId)}
                    >
                      <option value="">Select a ward project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          Ward {p.wardNo} — {p.title}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.projectId} />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                      Concern category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => update('category', e.target.value)}
                      className={inputClass(errors.category)}
                    >
                      <option value="">What best describes your concern?</option>
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <FieldError message={errors.category} />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                      Your message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      className={`${inputClass(errors.message)} resize-none`}
                      placeholder="Describe what you observed, when, and why it concerns you. Be specific — this helps officials investigate fairly."
                    />
                    <FieldError message={errors.message} />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      {isAuthenticated ? 'Your contact details (auto-filled)' : 'Optional contact details'}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="citizenName" className="block text-sm font-medium text-slate-700 mb-1">
                          Your name
                        </label>
                        <input
                          id="citizenName"
                          value={displayForm.citizenName}
                          onChange={(e) => update('citizenName', e.target.value)}
                          className={inputClass(false)}
                          placeholder="Leave blank to submit anonymously"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                            Phone
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={displayForm.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            className={inputClass(false)}
                            placeholder="98XXXXXXXX"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={displayForm.email}
                            onChange={(e) => update('email', e.target.value)}
                            className={inputClass(errors.email)}
                            placeholder="you@example.com"
                          />
                          <FieldError message={errors.email} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <FileUpload
                    id="complaintEvidence"
                    label="Supporting evidence"
                    hint="Drop image or PDF here"
                    value={form.evidenceFile}
                    onChange={handleEvidenceChange}
                    error={errors.evidence}
                    storageFolder="complaints"
                  />
                  <p className="text-xs text-slate-400">
                    Optional — attach a photo or PDF to support your concern
                  </p>

                  <div className="sticky bottom-0 pt-2 pb-1 bg-white">
                    <Button type="submit" disabled={submitting} icon={Send} className="w-full">
                      {submitting ? 'Submitting…' : 'Submit feedback'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Public feedback board</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {complaints.length} submission{complaints.length !== 1 ? 's' : ''}
                {verifiedCount > 0 && ` · ${verifiedCount} reviewed by officials`}
              </p>
            </div>
          </div>

          {complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquareHeart}
              title="No feedback yet"
              description="Be the first to raise a concern about ward project transparency."
            />
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint, i) => {
                const project = projects.find((p) => p.id === complaint.projectId);
                const ward = project ? getWardByNo(wards, project.wardNo) : null;
                return (
                  <ComplaintCard
                    key={complaint.id || `${complaint.projectId}-${complaint.createdAt}-${i}`}
                    complaint={complaint}
                    project={project}
                    ward={ward}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
