import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, FileText, Wallet, HardHat, Calendar, MapPin, Eye, ArrowRight, LayoutDashboard,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import FileUpload from '../components/ui/FileUpload';
import { StatusBadge, RiskLevelBadge } from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import FormSection, { FieldError, inputClass, PublicVisibilityWarning } from '../components/admin/FormSection';
import {
  EMPTY_PROJECT_FORM,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  validateProjectForm,
} from '../services/projectService';
import { WardReadOnlyField } from '../components/form/WardSelect';
import { formatWardLabel } from '../constants/wards';
import { formatCurrency } from '../utils/formatters';
import { canManageWard } from '../utils/permissions';
import { calculateTrustScore, getRiskLevel } from '../utils/riskEngine';

export default function AddProject() {
  const { addProject, addProof, projects } = useData();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const adminWardNo = profile?.wardNo;

  const [form, setForm] = useState({
    ...EMPTY_PROJECT_FORM,
    wardNo: adminWardNo ? String(adminWardNo) : '',
  });
  const [initialDocument, setInitialDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!canManageWard(profile, adminWardNo)) {
      setAuthError('You are not authorised to create projects for this ward.');
      return;
    }

    const payload = { ...form, wardNo: String(adminWardNo) };
    const validation = validateProjectForm(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const result = await addProject(payload, {
        uid: profile?.uid,
        fullName: profile?.fullName,
      });
      if (initialDocument?.fileUrl) {
        await addProof({
          projectId: result.id,
          title: 'Initial project document or location photo',
          type: 'before',
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: profile?.uid || null,
          wardNo: adminWardNo,
          ...initialDocument,
        }, { uid: profile?.uid });
      }
      setCreated(result);
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    const { id, project } = created;
    const trust = calculateTrustScore(project, projects);
    const risk = getRiskLevel(project, projects);

    return (
      <div className="space-y-6 max-w-2xl">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-emerald-900">Project created successfully</h2>
            <p className="text-sm text-emerald-700 mt-1">
              &ldquo;{project.title}&rdquo; is now live on the public portal.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 card-shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Created project preview</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={project.status} />
            <RiskLevelBadge level={risk.label} />
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{project.category}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{formatWardLabel(project.wardNo)}</p>
          <p className="text-sm text-slate-600 mt-3">{project.description}</p>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Allocated Budget</p>
              <p className="font-bold">{formatCurrency(project.allocatedBudget)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Tender Amount</p>
              <p className="font-bold">{formatCurrency(project.tenderAmount)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Trust Score</p>
              <p className="font-bold">{trust}/100</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Progress</p>
              <p className="font-bold">{project.progressPercent}%</p>
            </div>
          </div>
          <ProgressBar value={project.progressPercent} className="mt-4" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={`/projects/${id}`}>
            <Button variant="primary" icon={Eye}>View Public Page</Button>
          </Link>
          <Link to="/admin">
            <Button variant="secondary" icon={LayoutDashboard}>Back to Admin</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              setCreated(null);
              setForm({ ...EMPTY_PROJECT_FORM, wardNo: String(adminWardNo) });
            }}
          >
            Add Another Project
          </Button>
        </div>
      </div>
    );
  }

  const tenderExceeds = form.tenderAmount && form.allocatedBudget
    && Number(form.tenderAmount) > Number(form.allocatedBudget);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Add New Project</h1>
        <p className="text-sm text-slate-500 mt-1">Create a public ward project record for citizen transparency</p>
      </div>

      <PublicVisibilityWarning />

      {authError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormSection icon={FileText} title="Project Details" subtitle="Core information visible to citizens">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass(errors.title)}
                placeholder="e.g. Asan Galli Road Repair & Resurfacing"
              />
              <FieldError message={errors.title} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WardReadOnlyField
                wardNo={adminWardNo}
                hint="Projects are assigned to your logged-in ward."
              />
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className={inputClass(errors.category)}
                >
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <FieldError message={errors.category} />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className={`${inputClass(errors.description)} resize-none`}
                placeholder="Describe project scope, objectives, and expected outcomes for citizens…"
              />
              <FieldError message={errors.description} />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  className={`${inputClass(errors.location)} pl-10`}
                  placeholder="Street, area, or landmark"
                />
              </div>
              <FieldError message={errors.location} />
            </div>
          </div>
        </FormSection>

        <FormSection icon={Wallet} title="Budget & Tender" subtitle="Financial allocation and procurement value">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="allocatedBudget" className="block text-sm font-medium text-slate-700 mb-1">
                Allocated Budget (NPR) <span className="text-red-500">*</span>
              </label>
              <input
                id="allocatedBudget"
                type="number"
                min="0"
                value={form.allocatedBudget}
                onChange={(e) => update('allocatedBudget', e.target.value)}
                className={inputClass(errors.allocatedBudget)}
                placeholder="8500000"
              />
              <FieldError message={errors.allocatedBudget} />
            </div>
            <div>
              <label htmlFor="tenderAmount" className="block text-sm font-medium text-slate-700 mb-1">
                Tender Amount (NPR)
              </label>
              <input
                id="tenderAmount"
                type="number"
                min="0"
                value={form.tenderAmount}
                onChange={(e) => update('tenderAmount', e.target.value)}
                className={inputClass(errors.tenderAmount)}
                placeholder="Defaults to allocated budget"
              />
              <FieldError message={errors.tenderAmount} />
              {tenderExceeds && (
                <p className="text-xs text-amber-700 mt-1">Tender exceeds allocation — will trigger a risk flag</p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection icon={HardHat} title="Contractor" subtitle="Awarded vendor (optional for planned projects)">
          <div>
            <label htmlFor="contractorName" className="block text-sm font-medium text-slate-700 mb-1">
              Contractor Name
            </label>
            <input
              id="contractorName"
              value={form.contractorName}
              onChange={(e) => update('contractorName', e.target.value)}
              className={inputClass(false)}
              placeholder="e.g. Himalayan Road Builders Pvt. Ltd."
            />
            <p className="text-xs text-slate-400 mt-1">Leave blank if tender is still open or contractor not yet selected</p>
          </div>
        </FormSection>

        <FormSection icon={Calendar} title="Timeline & Status" subtitle="Schedule and current project state">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className={inputClass(errors.startDate)}
                />
                <FieldError message={errors.startDate} />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update('deadline', e.target.value)}
                  className={inputClass(errors.deadline)}
                />
                <FieldError message={errors.deadline} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className={inputClass(errors.status)}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <FieldError message={errors.status} />
              </div>
              <div>
                <label htmlFor="progressPercent" className="block text-sm font-medium text-slate-700 mb-1">
                  Progress Percentage <span className="text-red-500">*</span>
                </label>
                <input
                  id="progressPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={form.progressPercent}
                  onChange={(e) => update('progressPercent', e.target.value)}
                  className={inputClass(errors.progressPercent)}
                />
                <FieldError message={errors.progressPercent} />
                {form.progressPercent !== '' && !errors.progressPercent && (
                  <div className="mt-2">
                    <ProgressBar value={Number(form.progressPercent)} showLabel={false} size="sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection icon={FileText} title="Optional attachment" subtitle="Initial location photo or project document">
          <FileUpload
            id="initialProjectDocument"
            label="Initial project document or location photo"
            hint="Drop image or PDF here"
            value={initialDocument}
            onChange={setInitialDocument}
            storageFolder="projects"
          />
        </FormSection>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={submitting} icon={ArrowRight} iconPosition="right">
            {submitting ? 'Publishing…' : 'Publish Project'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
