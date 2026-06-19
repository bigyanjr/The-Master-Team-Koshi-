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
  paymentProofFile: null,
  // Progress Update
  progressAfter: '',
  progressStatus: 'Ongoing',
  progressRemarks: '',
  // Proof Upload
  proofType: 'during',
  proofTitle: '',
  proofFile: null,
  proofRemarks: '',
  proofDate: new Date().toISOString().split('T')[0],
  // Completion Update
  finalStatus: 'Completed',
  completionRemarks: '',
  completionProofFile: null,
  completionDate: new Date().toISOString().split('T')[0],
};

function filePayload(file) {
  if (!file?.fileUrl) return {};
  return {
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    fileType: file.fileType,
    fileSize: file.fileSize,
  };
}

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
      if (!form.proofFile?.fileUrl) errors.proofFile = 'Please upload a proof image or document';
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

  switch (form.updateType) {
    case 'payment':
      return {
        projectId,
        updateType: form.updateType,
        ...(await handlers.addPayment({
          projectId,
          amount: form.amount,
          date: form.paymentDate,
          milestone: form.milestone.trim(),
          remarks: form.paymentRemarks.trim(),
          proofFile: form.paymentProofFile,
        })),
      };

    case 'progress':
      return {
        projectId,
        updateType: form.updateType,
        ...(await handlers.addUpdate({
          projectId,
          progressAfter: form.progressAfter,
          status: form.progressStatus,
          remarks: form.progressRemarks.trim(),
          date: new Date().toISOString().split('T')[0],
        })),
      };

    case 'proof':
      return {
        projectId,
        updateType: form.updateType,
        ...(await handlers.addProof({
          projectId,
          title: form.proofTitle.trim(),
          type: form.proofType,
          uploadedAt: form.proofDate,
          remarks: form.proofRemarks.trim(),
          ...filePayload(form.proofFile),
        })),
      };

    case 'completion':
      return {
        projectId,
        updateType: form.updateType,
        ...(await handlers.completeProject({
          projectId,
          finalStatus: form.finalStatus,
          remarks: form.completionRemarks.trim(),
          proofFile: form.completionProofFile,
          date: form.completionDate,
        })),
      };

    default:
      throw new Error('Unknown update type');
  }
}

export { PROJECT_STATUSES };
