/**
 * Project update service — Firebase-ready abstraction.
 * Routes update types to injected store handlers (local state today, Firestore later).
 */

import { PROJECT_STATUSES } from './projectService';

export const UPDATE_TYPES = [
  { value: 'payment', label: 'Payment Release', description: 'Record a milestone payment with supporting proof' },
  { value: 'progress', label: 'Progress Update', description: 'Update completion percentage and project status' },
  { value: 'proof', label: 'Proof Upload', description: 'Add before/during/after photos or documents' },
  { value: 'completion', label: 'Completion Update', description: 'Mark project complete with final proof' },
];

export const PROOF_TYPES = [
  { value: 'before', label: 'Before Work' },
  { value: 'during', label: 'During Work' },
  { value: 'after', label: 'After Work' },
  { value: 'document', label: 'Document' },
];

export const EMPTY_UPDATE_FORM = {
  projectId: '',
  updateType: '',
  // Payment Release
  amount: '',
  paymentDate: new Date().toISOString().split('T')[0],
  milestone: '',
  paymentRemarks: '',
  paymentProofUrl: '',
  // Progress Update
  progressAfter: '',
  progressStatus: 'Ongoing',
  progressRemarks: '',
  // Proof Upload
  proofType: 'during',
  proofTitle: '',
  proofUrl: '',
  proofRemarks: '',
  proofDate: new Date().toISOString().split('T')[0],
  // Completion Update
  finalStatus: 'Completed',
  completionRemarks: '',
  completionProofUrl: '',
  completionDate: new Date().toISOString().split('T')[0],
};

export function validateUpdateForm(form) {
  const errors = {};

  if (!form.projectId) errors.projectId = 'Select a project';
  if (!form.updateType) errors.updateType = 'Select an update type';

  switch (form.updateType) {
    case 'payment':
      if (!form.amount || Number(form.amount) <= 0) errors.amount = 'Amount must be greater than zero';
      if (!form.paymentDate) errors.paymentDate = 'Payment date is required';
      if (!form.milestone?.trim()) errors.milestone = 'Milestone is required';
      break;

    case 'progress': {
      const progress = Number(form.progressAfter);
      if (form.progressAfter === '' || Number.isNaN(progress) || progress < 0 || progress > 100) {
        errors.progressAfter = 'Progress must be between 0 and 100';
      }
      if (!form.progressStatus) errors.progressStatus = 'Status is required';
      break;
    }

    case 'proof':
      if (!form.proofTitle?.trim()) errors.proofTitle = 'Title is required';
      if (!form.proofDate) errors.proofDate = 'Upload date is required';
      break;

    case 'completion':
      if (!form.finalStatus) errors.finalStatus = 'Final status is required';
      if (!form.completionRemarks?.trim()) errors.completionRemarks = 'Completion remarks are required';
      if (!form.completionDate) errors.completionDate = 'Completion date is required';
      break;

    default:
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Apply update via injected handlers.
 * @param {object} form
 * @param {{ addPayment, addUpdate, addProof, completeProject }} handlers
 */
export async function applyProjectUpdate(form, handlers) {
  const { valid, errors } = validateUpdateForm(form);
  if (!valid) {
    const err = new Error('Validation failed');
    err.validationErrors = errors;
    throw err;
  }

  const { projectId } = form;
  let summary = {};

  switch (form.updateType) {
    case 'payment':
      summary = await handlers.addPayment({
        projectId,
        amount: form.amount,
        date: form.paymentDate,
        milestone: form.milestone.trim(),
        remarks: form.paymentRemarks.trim(),
        proofUrl: form.paymentProofUrl.trim(),
      });
      break;

    case 'progress':
      summary = await handlers.addUpdate({
        projectId,
        progressAfter: form.progressAfter,
        status: form.progressStatus,
        remarks: form.progressRemarks.trim(),
        date: new Date().toISOString().split('T')[0],
      });
      break;

    case 'proof':
      summary = await handlers.addProof({
        projectId,
        title: form.proofTitle.trim(),
        type: form.proofType,
        url: form.proofUrl.trim(),
        uploadedAt: form.proofDate,
        remarks: form.proofRemarks.trim(),
      });
      break;

    case 'completion':
      summary = await handlers.completeProject({
        projectId,
        finalStatus: form.finalStatus,
        remarks: form.completionRemarks.trim(),
        proofUrl: form.completionProofUrl.trim(),
        date: form.completionDate,
      });
      break;

    default:
      throw new Error('Unknown update type');
  }

  return { projectId, updateType: form.updateType, ...summary };
}

export { PROJECT_STATUSES };
