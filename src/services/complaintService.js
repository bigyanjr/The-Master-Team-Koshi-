/**
 * Complaint service — Firebase-ready abstraction.
 */

export const COMPLAINT_CATEGORIES = [
  'Work not started',
  'Poor quality work',
  'Budget misuse concern',
  'Fake progress update',
  'Delay concern',
  'Other',
];

export const EMPTY_COMPLAINT_FORM = {
  projectId: '',
  citizenName: '',
  phone: '',
  email: '',
  category: '',
  message: '',
  evidenceUrl: '',
};

export function validateComplaintForm(form) {
  const errors = {};

  if (!form.projectId) errors.projectId = 'Please select a project';
  if (!form.category) errors.category = 'Please select a category';
  if (!form.message?.trim()) errors.message = 'Please describe your concern';
  else if (form.message.trim().length < 20) {
    errors.message = 'Please provide at least 20 characters so officials can understand the issue';
  }

  if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function mapFormToComplaint(form, id) {
  return {
    id,
    citizenName: form.citizenName?.trim() || null,
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    category: form.category,
    message: form.message.trim(),
    evidenceUrl: form.evidenceUrl?.trim() || null,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Submit complaint via injected store handler.
 * @param {object} form
 * @param {{ persist: (complaint, projectId) => string | Promise<string> }} adapter
 */
export async function submitComplaint(form, adapter) {
  const { valid, errors } = validateComplaintForm(form);
  if (!valid) {
    const err = new Error('Validation failed');
    err.validationErrors = errors;
    throw err;
  }

  const id = await adapter.generateId?.() ?? adapter.nextId?.();
  const complaint = mapFormToComplaint(form, id);
  await adapter.persist(complaint, form.projectId);
  return { id, complaint, projectId: form.projectId };
}

export function getComplaintCategoryLabel(category) {
  return category || 'General concern';
}

export function getCitizenDisplayName(citizenName) {
  return citizenName?.trim() || 'Anonymous citizen';
}
