import {
  createContext, useContext, useState, useCallback, useMemo, useEffect, useRef,
} from 'react';
import { seedData as initialData } from '../data/seedData';
import { getAllComplaints, getAllPayments } from '../utils/riskEngine';
import { isFirebaseConfigured } from '../firebase/config';
import { bindLocalStore } from '../services/localStore';
import {
  getProjects,
  addProject as addProjectService,
  addPayment as addPaymentService,
  addProof as addProofService,
} from '../services/projectService';
import { getWards } from '../services/wardService';
import {
  addComplaint as addComplaintService,
  updateComplaintStatus as updateComplaintStatusService,
  findComplaintInProjects,
  resolveComplaintId,
} from '../services/complaintService';

const DataContext = createContext(null);

export const DEMO_ADMIN_WARD = 1;

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function buildSeedAdminActivity(projects) {
  const events = [];
  projects.forEach((p) => {
    (p.payments ?? []).slice(-1).forEach((pay) => {
      events.push({
        id: `seed-pay-${p.id}-${pay.date}`,
        type: 'payment',
        title: 'Payment update posted',
        detail: `${pay.milestone} — ${p.title}`,
        date: pay.date,
        projectId: p.id,
      });
    });
    (p.proofs ?? []).slice(-1).forEach((proof) => {
      events.push({
        id: `seed-proof-${p.id}-${proof.uploadedAt}`,
        type: 'proof',
        title: 'Proof uploaded',
        detail: `${proof.title} — ${p.title}`,
        date: proof.uploadedAt,
        projectId: p.id,
      });
    });
  });
  return events.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
}

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [adminActivity, setAdminActivity] = useState(() => buildSeedAdminActivity(initialData.projects));
  const [dataLoading, setDataLoading] = useState(isFirebaseConfigured());
  const firebaseEnabled = isFirebaseConfigured();

  useEffect(() => {
    bindLocalStore({
      getSnapshot: () => dataRef.current,
      setProjects: (updater) => {
        setData((prev) => ({
          ...prev,
          projects: typeof updater === 'function' ? updater(prev.projects) : updater,
        }));
      },
    });
  }, []);

  useEffect(() => {
    if (!firebaseEnabled) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const [wards, projects] = await Promise.all([getWards(), getProjects()]);
        if (!cancelled) {
          setData((prev) => ({ ...prev, wards, projects }));
        }
      } catch (error) {
        console.warn('[WardWatch] Remote data load failed; using seed fallback.', error);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [firebaseEnabled]);

  const logActivity = useCallback((entry) => {
    setAdminActivity((prev) => [
      { ...entry, id: nextId('act'), date: entry.date || new Date().toISOString().split('T')[0] },
      ...prev,
    ]);
  }, []);

  const addProject = useCallback(async (form) => {
    const result = await addProjectService(form);
    setData((prev) => ({ ...prev, projects: [result.project, ...prev.projects] }));
    logActivity({ type: 'project', title: 'Project added', detail: result.project.title, projectId: result.id });
    return result;
  }, [logActivity]);

  const addUpdate = useCallback(({ projectId, title, description, progressAfter, status, remarks, date }) => {
    const progressPercent = Number(progressAfter);
    const updateDate = date || new Date().toISOString().split('T')[0];
    const proofTitle = title
      || (remarks ? `Progress update — ${remarks.slice(0, 50)}` : `Progress updated to ${progressPercent}%`);
    const nextStatus = status
      || (progressPercent >= 100 ? 'Completed' : undefined);

    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const resolvedStatus = nextStatus
          ?? (progressPercent >= 100 ? 'Completed' : p.status === 'Planned' ? 'Ongoing' : p.status);
        return {
          ...p,
          progressPercent,
          status: resolvedStatus,
          proofs: [
            ...(p.proofs ?? []),
            {
              type: 'during',
              title: proofTitle,
              url: `https://placehold.co/800x450/2563eb/white?text=${encodeURIComponent(proofTitle.slice(0, 20))}`,
              uploadedAt: updateDate,
              remarks: remarks || description || '',
            },
          ],
        };
      }),
    }));
    logActivity({ type: 'proof', title: 'Progress update posted', detail: proofTitle, projectId, date: updateDate });
    return { label: 'Progress Update', detail: `${progressPercent}% — ${nextStatus || 'status updated'}` };
  }, [logActivity]);

  const addPayment = useCallback(async (payload) => {
    const result = await addPaymentService(payload.projectId, payload);
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === result.projectId ? result.project : p)),
    }));
    logActivity({
      type: 'payment',
      title: 'Payment update posted',
      detail: payload.milestone,
      projectId: payload.projectId,
      date: result.payment.date,
    });
    return { label: 'Payment Release', detail: payload.milestone };
  }, [logActivity]);

  const addProof = useCallback(async (payload) => {
    const result = await addProofService(payload.projectId, payload);
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === result.projectId ? result.project : p)),
    }));
    logActivity({
      type: 'proof',
      title: 'Proof uploaded',
      detail: payload.title,
      projectId: payload.projectId,
      date: result.proof.uploadedAt,
    });
    return { label: 'Proof Upload', detail: payload.title };
  }, [logActivity]);

  const completeProject = useCallback(({ projectId, finalStatus, remarks, proofFile, proofUrl, date }) => {
    const completionDate = date || new Date().toISOString().split('T')[0];
    const proofTitle = `Project completion — ${remarks.slice(0, 40)}`;
    const file = proofFile || (proofUrl ? { fileUrl: proofUrl } : null);

    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const proofs = [
          ...(p.proofs ?? []),
          {
            id: `proof-${Date.now()}`,
            type: 'after',
            title: proofTitle,
            fileUrl: file?.fileUrl || `https://placehold.co/800x450/059669/white?text=${encodeURIComponent('Completed')}`,
            fileName: file?.fileName || null,
            fileType: file?.fileType || null,
            fileSize: file?.fileSize ?? null,
            url: file?.fileUrl || `https://placehold.co/800x450/059669/white?text=${encodeURIComponent('Completed')}`,
            uploadedAt: completionDate,
            remarks,
          },
        ];
        return {
          ...p,
          progressPercent: 100,
          status: finalStatus || 'Completed',
          proofs,
        };
      }),
    }));
    logActivity({
      type: 'project',
      title: 'Project marked complete',
      detail: remarks,
      projectId,
      date: completionDate,
    });
    return { label: 'Completion Update', detail: finalStatus || 'Completed' };
  }, [logActivity]);

  const addComplaint = useCallback(async (form) => {
    const result = await addComplaintService(form);

    setData((prev) => {
      if (!form.projectId) return prev;
      return {
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === form.projectId
            ? { ...p, complaints: [result.complaint, ...(p.complaints ?? [])] }
            : p
        ),
      };
    });

    logActivity({
      type: 'complaint',
      title: 'Citizen feedback submitted',
      detail: result.complaint.category,
      projectId: form.projectId,
      date: result.complaint.createdAt,
    });

    return result;
  }, [logActivity]);

  const updateComplaintStatus = useCallback(async (arg, statusArg) => {
    const projects = dataRef.current.projects;

    let complaintId;
    let status;
    let projectId;

    if (typeof arg === 'object') {
      projectId = arg.projectId;
      status = arg.status;
      complaintId = arg.id
        || resolveComplaintId(
          { id: arg.id, createdAt: arg.complaintCreatedAt },
          projectId,
        );
    } else {
      complaintId = arg;
      status = statusArg;
    }

    const located = findComplaintInProjects(projects, complaintId);
    if (located) {
      projectId = located.projectId;
      complaintId = resolveComplaintId(located.complaint, located.projectId);
    }

    await updateComplaintStatusService(complaintId, status);

    if (projectId) {
      setData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            complaints: (p.complaints ?? []).map((c) =>
              resolveComplaintId(c, p.id) === complaintId ? { ...c, id: complaintId, status } : c
            ),
          };
        }),
      }));
    }

    logActivity({
      type: 'complaint',
      title: 'Complaint status changed',
      detail: `Marked as ${status}`,
      projectId,
    });
  }, [logActivity]);

  const value = useMemo(() => {
    const { municipality, wards, projects } = data;
    return {
      municipality,
      wards,
      projects,
      payments: getAllPayments(projects),
      complaints: getAllComplaints(projects),
      adminActivity,
      demoAdminWard: DEMO_ADMIN_WARD,
      firebaseEnabled,
      dataLoading,
      addProject,
      addUpdate,
      addPayment,
      addProof,
      completeProject,
      addComplaint,
      updateComplaintStatus,
    };
  }, [
    data,
    adminActivity,
    firebaseEnabled,
    dataLoading,
    addProject,
    addUpdate,
    addPayment,
    addProof,
    completeProject,
    addComplaint,
    updateComplaintStatus,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function useDataStore() {
  return useData();
}
