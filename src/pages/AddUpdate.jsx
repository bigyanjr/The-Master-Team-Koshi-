import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle, Eye, LayoutDashboard, ArrowRight, Banknote, TrendingUp,
  Camera, Flag, FolderKanban, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import FormSection, { FieldError, inputClass, PublicVisibilityWarning } from '../components/admin/FormSection';
import {
  EMPTY_UPDATE_FORM,
  UPDATE_TYPES,
  PROOF_TYPES,
  PROJECT_STATUSES,
  validateUpdateForm,
  applyProjectUpdate,
} from '../services/updateService';
import { formatCurrency } from '../utils/formatters';

const TYPE_ICONS = {
  payment: Banknote,
  progress: TrendingUp,
  proof: Camera,
  completion: Flag,
};

const STEPS = [
  { id: 1, label: 'Project' },
  { id: 2, label: 'Update Type' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Publish' },
];

function StepIndicator({ currentStep }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 mb-6 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <li key={step.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? 'bg-brand-700 text-white'
                  : done
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                active ? 'bg-white/20' : done ? 'bg-emerald-200' : 'bg-slate-200'
              }`}>
                {done ? '✓' : step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function AddUpdate() {
  const { projects, addPayment, addUpdate, addProof, completeProject, demoAdminWard } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    ...EMPTY_UPDATE_FORM,
    projectId: searchParams.get('project') || '',
  });
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const wardProjects = projects.filter((p) => p.wardNo === demoAdminWard);
  const projectList = wardProjects.length ? wardProjects : projects;
  const selectedProject = projects.find((p) => p.id === form.projectId);
  const TypeIcon = form.updateType ? TYPE_ICONS[form.updateType] : FolderKanban;

  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) setForm((f) => ({ ...f, projectId }));
  }, [searchParams]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (stepNum) => {
    const stepErrors = {};
    if (stepNum === 1 && !form.projectId) stepErrors.projectId = 'Select a project';
    if (stepNum === 2 && !form.updateType) stepErrors.updateType = 'Select an update type';
    if (stepNum === 3) {
      const { errors: fieldErrors } = validateUpdateForm(form);
      Object.assign(stepErrors, fieldErrors);
      delete stepErrors.projectId;
      delete stepErrors.updateType;
    }
    if (stepNum === 4 && !confirmed) stepErrors.confirmed = 'Confirm public visibility before publishing';
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setErrors({});

    try {
      const summary = await applyProjectUpdate(form, {
        addPayment,
        addUpdate,
        addProof,
        completeProject,
      });
      setResult(summary);
    } catch (err) {
      if (err.validationErrors) setErrors(err.validationErrors);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const project = projects.find((p) => p.id === result.projectId);
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-emerald-900">Update published successfully</h2>
            <p className="text-sm text-emerald-700 mt-1">
              {result.label} is now visible to citizens on the public portal.
            </p>
            {result.detail && (
              <p className="text-sm text-emerald-600 mt-1 font-medium">{result.detail}</p>
            )}
          </div>
        </div>

        {project && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 card-shadow-lg">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Updated project</p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={project.status} />
              <span className="text-xs text-slate-500">Ward {project.wardNo}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
            <ProgressBar value={project.progressPercent} className="mt-4" />
            <p className="text-xs text-slate-500 mt-2">{project.progressPercent}% complete</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link to={`/projects/${result.projectId}`}>
            <Button variant="primary" icon={Eye}>View Public Page</Button>
          </Link>
          <Link to="/admin">
            <Button variant="secondary" icon={LayoutDashboard}>Back to Admin</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              setStep(1);
              setConfirmed(false);
              setForm({ ...EMPTY_UPDATE_FORM, projectId: form.projectId });
            }}
          >
            Post Another Update
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Post Project Update</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add payment milestones, progress, proofs, or completion records — all publicly visible
        </p>
      </div>

      <StepIndicator currentStep={step} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Step 1 — Select project */}
        {step === 1 && (
          <FormSection icon={FolderKanban} title="Step 1 — Select Project" subtitle="Choose the ward project to update">
            <div className="space-y-4">
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
                  <option value="">Select project</option>
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>
                      W{p.wardNo} — {p.title} ({p.progressPercent}%)
                    </option>
                  ))}
                </select>
                <FieldError message={errors.projectId} />
              </div>

              {selectedProject && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selectedProject.status} />
                    <span className="text-xs text-slate-500">{selectedProject.category}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{selectedProject.title}</p>
                  <ProgressBar value={selectedProject.progressPercent} />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Budget</span>
                      <p className="font-semibold text-slate-700">{formatCurrency(selectedProject.allocatedBudget)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Contractor</span>
                      <p className="font-semibold text-slate-700">{selectedProject.contractorName || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Step 2 — Update type */}
        {step === 2 && (
          <FormSection icon={TypeIcon} title="Step 2 — Update Type" subtitle="What kind of public record are you adding?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {UPDATE_TYPES.map(({ value, label, description }) => {
                const Icon = TYPE_ICONS[value];
                const selected = form.updateType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('updateType', value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${selected ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.updateType} />
          </FormSection>
        )}

        {/* Step 3 — Type-specific fields */}
        {step === 3 && form.updateType === 'payment' && (
          <FormSection icon={Banknote} title="Step 3 — Payment Release" subtitle="Milestone payment details for the public ledger">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (NPR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    className={inputClass(errors.amount)}
                    placeholder="1640000"
                  />
                  <FieldError message={errors.amount} />
                </div>
                <div>
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => update('paymentDate', e.target.value)}
                    className={inputClass(errors.paymentDate)}
                  />
                  <FieldError message={errors.paymentDate} />
                </div>
              </div>
              <div>
                <label htmlFor="milestone" className="block text-sm font-medium text-slate-700 mb-1">
                  Milestone <span className="text-red-500">*</span>
                </label>
                <input
                  id="milestone"
                  value={form.milestone}
                  onChange={(e) => update('milestone', e.target.value)}
                  className={inputClass(errors.milestone)}
                  placeholder="e.g. Phase 2 completion (30%)"
                />
                <FieldError message={errors.milestone} />
              </div>
              <div>
                <label htmlFor="paymentRemarks" className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                <textarea
                  id="paymentRemarks"
                  rows={3}
                  value={form.paymentRemarks}
                  onChange={(e) => update('paymentRemarks', e.target.value)}
                  className={`${inputClass(false)} resize-none`}
                  placeholder="Official remarks for the public payment record…"
                />
              </div>
              <div>
                <label htmlFor="paymentProofUrl" className="block text-sm font-medium text-slate-700 mb-1">
                  Proof Document URL
                </label>
                <input
                  id="paymentProofUrl"
                  value={form.paymentProofUrl}
                  onChange={(e) => update('paymentProofUrl', e.target.value)}
                  className={inputClass(false)}
                  placeholder="https://… (leave blank for demo placeholder)"
                />
                <p className="text-xs text-slate-400 mt-1">Supporting document link — also added to project proof gallery</p>
              </div>
            </div>
          </FormSection>
        )}

        {step === 3 && form.updateType === 'progress' && (
          <FormSection icon={TrendingUp} title="Step 3 — Progress Update" subtitle="Report work completion percentage and status">
            <div className="space-y-4">
              {selectedProject && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Current progress: {selectedProject.progressPercent}%</p>
                  <ProgressBar value={selectedProject.progressPercent} size="sm" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="progressAfter" className="block text-sm font-medium text-slate-700 mb-1">
                    New Progress (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="progressAfter"
                    type="number"
                    min="0"
                    max="100"
                    value={form.progressAfter}
                    onChange={(e) => update('progressAfter', e.target.value)}
                    className={inputClass(errors.progressAfter)}
                    placeholder="0–100"
                  />
                  <FieldError message={errors.progressAfter} />
                  {form.progressAfter !== '' && !errors.progressAfter && (
                    <div className="mt-2">
                      <ProgressBar value={Number(form.progressAfter)} showLabel={false} size="sm" />
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="progressStatus" className="block text-sm font-medium text-slate-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="progressStatus"
                    value={form.progressStatus}
                    onChange={(e) => update('progressStatus', e.target.value)}
                    className={inputClass(errors.progressStatus)}
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <FieldError message={errors.progressStatus} />
                </div>
              </div>
              <div>
                <label htmlFor="progressRemarks" className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                <textarea
                  id="progressRemarks"
                  rows={4}
                  value={form.progressRemarks}
                  onChange={(e) => update('progressRemarks', e.target.value)}
                  className={`${inputClass(false)} resize-none`}
                  placeholder="Describe work completed, inspections passed, next steps…"
                />
              </div>
            </div>
          </FormSection>
        )}

        {step === 3 && form.updateType === 'proof' && (
          <FormSection icon={Camera} title="Step 3 — Proof Upload" subtitle="Photo or document evidence for citizen verification">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proofType" className="block text-sm font-medium text-slate-700 mb-1">
                    Proof Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="proofType"
                    value={form.proofType}
                    onChange={(e) => update('proofType', e.target.value)}
                    className={inputClass(false)}
                  >
                    {PROOF_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="proofDate" className="block text-sm font-medium text-slate-700 mb-1">
                    Upload Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="proofDate"
                    type="date"
                    value={form.proofDate}
                    onChange={(e) => update('proofDate', e.target.value)}
                    className={inputClass(errors.proofDate)}
                  />
                  <FieldError message={errors.proofDate} />
                </div>
              </div>
              <div>
                <label htmlFor="proofTitle" className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="proofTitle"
                  value={form.proofTitle}
                  onChange={(e) => update('proofTitle', e.target.value)}
                  className={inputClass(errors.proofTitle)}
                  placeholder="e.g. Asphalt surfacing — southern section complete"
                />
                <FieldError message={errors.proofTitle} />
              </div>
              <div>
                <label htmlFor="proofUrl" className="block text-sm font-medium text-slate-700 mb-1">File URL</label>
                <input
                  id="proofUrl"
                  value={form.proofUrl}
                  onChange={(e) => update('proofUrl', e.target.value)}
                  className={inputClass(false)}
                  placeholder="https://… (leave blank for demo placeholder image)"
                />
              </div>
              <div>
                <label htmlFor="proofRemarks" className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                <textarea
                  id="proofRemarks"
                  rows={3}
                  value={form.proofRemarks}
                  onChange={(e) => update('proofRemarks', e.target.value)}
                  className={`${inputClass(false)} resize-none`}
                  placeholder="Additional context for citizens…"
                />
              </div>
            </div>
          </FormSection>
        )}

        {step === 3 && form.updateType === 'completion' && (
          <FormSection icon={Flag} title="Step 3 — Completion Update" subtitle="Final project status and completion proof">
            <div className="space-y-4">
              <div>
                <label htmlFor="finalStatus" className="block text-sm font-medium text-slate-700 mb-1">
                  Final Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="finalStatus"
                  value={form.finalStatus}
                  onChange={(e) => update('finalStatus', e.target.value)}
                  className={inputClass(errors.finalStatus)}
                >
                  {PROJECT_STATUSES.filter((s) => ['Completed', 'Delayed', 'Ongoing'].includes(s)).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <FieldError message={errors.finalStatus} />
              </div>
              <div>
                <label htmlFor="completionDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Completion Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="completionDate"
                  type="date"
                  value={form.completionDate}
                  onChange={(e) => update('completionDate', e.target.value)}
                  className={inputClass(errors.completionDate)}
                />
                <FieldError message={errors.completionDate} />
              </div>
              <div>
                <label htmlFor="completionRemarks" className="block text-sm font-medium text-slate-700 mb-1">
                  Completion Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="completionRemarks"
                  rows={4}
                  value={form.completionRemarks}
                  onChange={(e) => update('completionRemarks', e.target.value)}
                  className={`${inputClass(errors.completionRemarks)} resize-none`}
                  placeholder="Final inspection notes, handover details, citizen-facing summary…"
                />
                <FieldError message={errors.completionRemarks} />
              </div>
              <div>
                <label htmlFor="completionProofUrl" className="block text-sm font-medium text-slate-700 mb-1">
                  Completion Proof URL
                </label>
                <input
                  id="completionProofUrl"
                  value={form.completionProofUrl}
                  onChange={(e) => update('completionProofUrl', e.target.value)}
                  className={inputClass(false)}
                  placeholder="https://… (leave blank for demo placeholder)"
                />
              </div>
            </div>
          </FormSection>
        )}

        {step === 3 && !form.updateType && (
          <FormSection icon={FolderKanban} title="Step 3 — Details">
            <p className="text-sm text-slate-500">Go back and select an update type first.</p>
          </FormSection>
        )}

        {/* Step 4 — Confirm & publish */}
        {step === 4 && (
          <div className="space-y-5">
            <PublicVisibilityWarning />

            <FormSection icon={ShieldCheck} title="Step 4 — Review & Publish" subtitle="Confirm this update for the public record">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Project</span>
                    <span className="font-medium text-slate-900 text-right">{selectedProject?.title || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Update type</span>
                    <span className="font-medium text-slate-900">
                      {UPDATE_TYPES.find((t) => t.value === form.updateType)?.label || '—'}
                    </span>
                  </div>
                  {form.updateType === 'payment' && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium text-slate-900">{formatCurrency(Number(form.amount))}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Milestone</span>
                        <span className="font-medium text-slate-900 text-right">{form.milestone}</span>
                      </div>
                    </>
                  )}
                  {form.updateType === 'progress' && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">New progress</span>
                      <span className="font-medium text-slate-900">{form.progressAfter}% · {form.progressStatus}</span>
                    </div>
                  )}
                  {form.updateType === 'proof' && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Proof</span>
                      <span className="font-medium text-slate-900 text-right">{form.proofTitle}</span>
                    </div>
                  )}
                  {form.updateType === 'completion' && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Final status</span>
                      <span className="font-medium text-slate-900">{form.finalStatus}</span>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-brand-200 bg-brand-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => {
                      setConfirmed(e.target.checked);
                      if (errors.confirmed) setErrors((prev) => ({ ...prev, confirmed: undefined }));
                    }}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong className="text-brand-900">This update will be visible to citizens.</strong>
                    {' '}I confirm the information is accurate and ready for public transparency.
                  </span>
                </label>
                <FieldError message={errors.confirmed} />
              </div>
            </FormSection>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 pt-5">
          {step < 4 ? (
            <>
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={goBack}>Back</Button>
              )}
              <Button type="button" onClick={goNext} icon={ArrowRight} iconPosition="right">
                Continue
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>Cancel</Button>
            </>
          ) : (
            <>
              <Button type="submit" disabled={submitting} icon={ShieldCheck}>
                {submitting ? 'Publishing…' : 'Publish Update'}
              </Button>
              <Button type="button" variant="secondary" onClick={goBack}>Back</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>Cancel</Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
