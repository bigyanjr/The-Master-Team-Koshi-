import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS, getDb, isFirebaseConfigured } from '../firebase/config';
import { getLocalProjects } from './localStore';
import { generateEntityId } from './projectService';
import { UPLOAD_MAX_BYTES } from './uploadService';

export { UPLOAD_MAX_BYTES as EVIDENCE_MAX_BYTES, UPLOAD_ACCEPT_STRING as EVIDENCE_ACCEPT } from './uploadService';

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
  evidenceFile: null,
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

  if (form.evidenceFile?.fileSize && form.evidenceFile.fileSize > UPLOAD_MAX_BYTES) {
    errors.evidence = 'File must be 10 MB or smaller';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function mapFormToComplaint(form, id) {
  const evidence = form.evidenceFile?.fileUrl
    ? {
      fileUrl: form.evidenceFile.fileUrl,
      fileName: form.evidenceFile.fileName,
      fileType: form.evidenceFile.fileType,
      uploadedAt: new Date().toISOString().split('T')[0],
    }
    : null;

  return {
    id,
    citizenName: form.citizenName?.trim() || null,
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    submittedByUid: form.submittedByUid || null,
    category: form.category,
    message: form.message.trim(),
    evidence,
    evidenceUrl: evidence?.fileUrl || null,
    evidenceFileName: evidence?.fileName || null,
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

export function resolveComplaintId(complaint, projectId) {
  return complaint.id || `${projectId}-${complaint.createdAt}`;
}

export function findComplaintInProjects(projects, complaintId) {
  for (const project of projects) {
    const complaints = project.complaints ?? [];
    const index = complaints.findIndex(
      (c) => resolveComplaintId(c, project.id) === complaintId,
    );
    if (index >= 0) {
      return { projectId: project.id, index, complaint: complaints[index] };
    }
  }
  return null;
}

export async function addComplaint(data) {
  const id = generateEntityId('comp');
  const complaint = mapFormToComplaint(data, id);
  const { projectId } = data;

  if (!projectId) {
    throw new Error('projectId is required');
  }

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      await setDoc(doc(db, COLLECTIONS.complaints, id), { ...complaint, projectId });
    }
  }

  return { id, complaint, projectId };
}

export async function updateComplaintStatus(id, status) {
  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      await updateDoc(doc(db, COLLECTIONS.complaints, id), { status });
    }
  }

  return { id, status };
}

export async function getComplaints() {
  const projects = getLocalProjects();
  if (!isFirebaseConfigured()) {
    return projects.flatMap((p) =>
      (p.complaints ?? []).map((c) => ({ ...c, projectId: p.id })),
    );
  }

  try {
    const db = getDb();
    if (!db) {
      return projects.flatMap((p) =>
        (p.complaints ?? []).map((c) => ({ ...c, projectId: p.id })),
      );
    }

    const snapshot = await getDocs(collection(db, COLLECTIONS.complaints));
    if (snapshot.empty) {
      return projects.flatMap((p) =>
        (p.complaints ?? []).map((c) => ({ ...c, projectId: p.id })),
      );
    }

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('[WardWatch] Firestore getComplaints failed, using local data.', error);
    return projects.flatMap((p) =>
      (p.complaints ?? []).map((c) => ({ ...c, projectId: p.id })),
    );
  }
}
