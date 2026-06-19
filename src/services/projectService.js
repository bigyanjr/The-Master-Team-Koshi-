/**
 * Project service — form helpers + Firestore with local seed fallback.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS, getDb, isFirebaseConfigured } from '../firebase/config';
import { getLocalProjects } from './localStore';
import { seedData } from '../data/seedData';

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

// ─── Firestore + local fallback ─────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function generateEntityId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function omitNestedFields(project) {
  const copy = { ...project };
  delete copy.payments;
  delete copy.proofs;
  delete copy.complaints;
  return copy;
}

function stripRelationId(item) {
  const copy = { ...item };
  delete copy.projectId;
  return copy;
}

async function fetchCollection(name) {
  const db = getDb();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function assembleProjects(projects, payments, proofs, complaints) {
  return projects.map((project) => ({
    ...project,
    payments: payments
      .filter((p) => p.projectId === project.id)
      .map(stripRelationId)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    proofs: proofs
      .filter((p) => p.projectId === project.id)
      .map(stripRelationId)
      .sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt)),
    complaints: complaints
      .filter((c) => c.projectId === project.id)
      .map(stripRelationId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  }));
}

async function fetchProjectsFromFirestore() {
  const [projects, payments, proofs, complaints] = await Promise.all([
    fetchCollection(COLLECTIONS.projects),
    fetchCollection(COLLECTIONS.payments),
    fetchCollection(COLLECTIONS.proofs),
    fetchCollection(COLLECTIONS.complaints),
  ]);

  if (projects.length === 0) return null;
  return assembleProjects(projects, payments, proofs, complaints);
}

export async function getProjects() {
  if (!isFirebaseConfigured()) {
    return getLocalProjects();
  }

  try {
    const remote = await fetchProjectsFromFirestore();
    if (remote?.length) return remote;
    return getLocalProjects();
  } catch (error) {
    console.warn('[WardWatch] Firestore getProjects failed, using local seed data.', error);
    return getLocalProjects();
  }
}

export async function getProjectById(id) {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) ?? null;
}

function buildPaymentPayload(projectId, data, paymentId = generateEntityId('pay')) {
  const paymentDate = data.date || todayISO();
  return {
    id: paymentId,
    projectId,
    amount: Number(data.amount),
    date: paymentDate,
    milestone: data.milestone,
    remarks: data.remarks || '',
    proofDocumentUrl: data.proofUrl || data.proofDocumentUrl || null,
  };
}

function buildProofPayload(projectId, data, proofId = generateEntityId('proof')) {
  const proofDate = data.uploadedAt || data.date || todayISO();
  const title = data.title || 'Project proof';
  const fileUrl = data.fileUrl || data.url || null;

  const proof = {
    id: proofId,
    projectId,
    type: data.type || 'during',
    title,
    fileUrl,
    fileName: data.fileName || null,
    fileType: data.fileType || null,
    fileSize: data.fileSize ?? null,
    uploadedBy: data.uploadedBy || null,
    uploadedAt: proofDate,
    remarks: data.remarks || '',
    url: fileUrl,
  };

  if (!proof.fileUrl) {
    const placeholder = `https://placehold.co/800x450/059669/white?text=${encodeURIComponent(title.slice(0, 16))}`;
    proof.fileUrl = placeholder;
    proof.url = placeholder;
  }

  return proof;
}

export function applyPaymentToProject(project, data) {
  const payment = buildPaymentPayload(project.id, data);
  const proofs = [...(project.proofs ?? [])];

  if (data.proofUrl || data.proofFile?.fileUrl || data.fileUrl) {
    const file = data.proofFile || {
      fileUrl: data.proofUrl || data.fileUrl,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedBy: data.uploadedBy,
    };
    proofs.push(stripRelationId(buildProofPayload(project.id, {
      type: 'document',
      title: `${data.milestone} — payment proof`,
      ...file,
      uploadedAt: payment.date,
      remarks: data.remarks || '',
    })));
  }

  return {
    ...project,
    payments: [...(project.payments ?? []), stripRelationId(payment)],
    proofs,
    status: project.status === 'Planned' ? 'Ongoing' : project.status,
  };
}

export function applyProofToProject(project, data) {
  const proof = buildProofPayload(project.id, data);
  return {
    ...project,
    proofs: [...(project.proofs ?? []), stripRelationId(proof)],
  };
}

async function writePaymentToFirestore(payment, proofDoc) {
  const db = getDb();
  if (!db) return;

  await setDoc(doc(db, COLLECTIONS.payments, payment.id), payment);
  if (proofDoc) {
    await setDoc(doc(db, COLLECTIONS.proofs, proofDoc.id), proofDoc);
  }

  const projectRef = doc(db, COLLECTIONS.projects, payment.projectId);
  const projectSnap = await getDoc(projectRef);
  if (projectSnap.exists() && projectSnap.data().status === 'Planned') {
    await updateDoc(projectRef, { status: 'Ongoing' });
  }
}

async function writeProofToFirestore(proof) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, COLLECTIONS.proofs, proof.id), proof);
}

async function writeProjectToFirestore(project) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, COLLECTIONS.projects, project.id), omitNestedFields(project));
}

export async function addPayment(projectId, data) {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const payment = buildPaymentPayload(projectId, data);
  let proofDoc = null;

  if (data.proofUrl || data.proofFile?.fileUrl || data.fileUrl) {
    const file = data.proofFile || {
      fileUrl: data.proofUrl || data.fileUrl,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedBy: data.uploadedBy,
    };
    proofDoc = buildProofPayload(projectId, {
      type: 'document',
      title: `${data.milestone} — payment proof`,
      ...file,
      uploadedAt: payment.date,
      remarks: data.remarks || '',
    });
  }

  if (isFirebaseConfigured()) {
    await writePaymentToFirestore(payment, proofDoc);
  }

  const updatedProject = applyPaymentToProject(project, data);
  return {
    projectId,
    payment: stripRelationId(payment),
    proof: proofDoc ? stripRelationId(proofDoc) : null,
    project: updatedProject,
  };
}

export async function addProof(projectId, data) {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const proof = buildProofPayload(projectId, data);

  if (isFirebaseConfigured()) {
    await writeProofToFirestore(proof);
  }

  const updatedProject = applyProofToProject(project, data);
  return {
    projectId,
    proof: stripRelationId(proof),
    project: updatedProject,
  };
}

export async function addProject(data) {
  const id = data.id || generateEntityId('proj');
  const project = data.wardNo !== undefined && data.title
    ? mapFormToProject(data, id)
    : {
      payments: [],
      proofs: [],
      complaints: [],
      ...data,
      id,
    };

  if (isFirebaseConfigured()) {
    await writeProjectToFirestore(project);
  }

  return { id: project.id, project };
}

/** Optional dev helper — push demo seed into Firestore. */
export async function seedProjectsToFirestore(projects = seedData.projects) {
  if (!isFirebaseConfigured()) return false;

  const db = getDb();
  if (!db) return false;

  await Promise.all(
    projects.map(async (project) => {
      await setDoc(doc(db, COLLECTIONS.projects, project.id), omitNestedFields(project), { merge: true });

      await Promise.all(
        (project.payments ?? []).map((payment, index) => {
          const paymentId = payment.id || `${project.id}-pay-${index}`;
          return setDoc(doc(db, COLLECTIONS.payments, paymentId), {
            ...payment,
            id: paymentId,
            projectId: project.id,
          });
        }),
      );

      await Promise.all(
        (project.proofs ?? []).map((proof, index) => {
          const proofId = proof.id || `${project.id}-proof-${index}`;
          return setDoc(doc(db, COLLECTIONS.proofs, proofId), {
            ...proof,
            id: proofId,
            projectId: project.id,
          });
        }),
      );

      await Promise.all(
        (project.complaints ?? []).map((complaint, index) => {
          const complaintId = complaint.id || `${project.id}-comp-${index}`;
          return setDoc(doc(db, COLLECTIONS.complaints, complaintId), {
            ...complaint,
            id: complaintId,
            projectId: project.id,
          });
        }),
      );
    }),
  );

  return true;
}
