/**
 * Project service — Firebase-ready abstraction.
 * Swap `createProject` implementation when connecting Firestore.
 */

export const PROJECT_CATEGORIES = [
  'Roads',
  'Drainage',
  'Electrical',
  'Education',
  'Healthcare',
  'Water Supply',
  'Sanitation',
  'Parks',
  'Footpath',
  'Digital Infrastructure',
  'Markets',
];

export const PROJECT_STATUSES = [
  'Planned',
  'Tender Open',
  'Ongoing',
  'Completed',
  'Delayed',
];

export const EMPTY_PROJECT_FORM = {
  title: '',
  wardNo: '',
  category: 'Roads',
  description: '',
  allocatedBudget: '',
  tenderAmount: '',
  contractorName: '',
  startDate: '',
  deadline: '',
  location: '',
  status: 'Planned',
  progressPercent: '0',
};

export function validateProjectForm(form) {
  const errors = {};

  if (!form.title?.trim()) errors.title = 'Project title is required';
  if (!form.wardNo) errors.wardNo = 'Ward number is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.description?.trim()) errors.description = 'Description is required';
  if (!form.location?.trim()) errors.location = 'Location is required';

  if (!form.allocatedBudget || Number(form.allocatedBudget) <= 0) {
    errors.allocatedBudget = 'Allocated budget must be greater than zero';
  }

  if (form.tenderAmount && Number(form.tenderAmount) < 0) {
    errors.tenderAmount = 'Tender amount cannot be negative';
  }

  if (!form.startDate) errors.startDate = 'Start date is required';
  if (!form.deadline) errors.deadline = 'Deadline is required';

  if (form.startDate && form.deadline && new Date(form.deadline) < new Date(form.startDate)) {
    errors.deadline = 'Deadline must be on or after start date';
  }

  const progress = Number(form.progressPercent);
  if (form.progressPercent === '' || Number.isNaN(progress) || progress < 0 || progress > 100) {
    errors.progressPercent = 'Progress must be between 0 and 100';
  }

  if (!form.status) errors.status = 'Status is required';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function mapFormToProject(form, id) {
  const progressPercent = Math.min(100, Math.max(0, Number(form.progressPercent) || 0));

  return {
    id,
    wardNo: Number(form.wardNo),
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim(),
    allocatedBudget: Number(form.allocatedBudget),
    tenderAmount: Number(form.tenderAmount || form.allocatedBudget),
    contractorName: form.contractorName?.trim() || null,
    startDate: form.startDate,
    deadline: form.deadline,
    status: form.status || 'Planned',
    progressPercent,
    location: form.location.trim(),
    coordinates: null,
    payments: [],
    proofs: [],
    complaints: [],
  };
}

/**
 * Create project via injected store handler (local state today, Firestore later).
 * @param {object} form - Raw form values
 * @param {{ persist: (project) => string | Promise<string> }} adapter
 * @returns {Promise<{ id: string, project: object }>}
 */
export async function createProject(form, adapter) {
  const { valid, errors } = validateProjectForm(form);
  if (!valid) {
    const err = new Error('Validation failed');
    err.validationErrors = errors;
    throw err;
  }

  // Firebase hook point: generate id client-side or let Firestore assign
  const id = await adapter.generateId?.() ?? adapter.nextId?.();
  const project = mapFormToProject(form, id);
  await adapter.persist(project);
  return { id: project.id, project };
}
