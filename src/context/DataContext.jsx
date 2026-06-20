import {
  createContext, useContext, useState, useCallback, useMemo, useEffect, useRef,
} from 'react';
import { getInitialAppData } from '../config/demoSeed';
import { getAllComplaints, getAllPayments } from '../utils/riskEngine';
import { getPublicProjects } from '../utils/projectVisibility';
import { isFirebaseConfigured } from '../firebase/config';
import { bindLocalStore } from '../services/localStore';
import {
  getProjects,
  addProject as addProjectService,
  addPayment as addPaymentService,
  addProof as addProofService,
  updateProjectProgress,
} from '../services/projectService';
import { getWards } from '../services/wardService';
import {
  addComplaint as addComplaintService,
  updateComplaintStatus as updateComplaintStatusService,
  findComplaintInProjects,
  resolveComplaintId,
} from '../services/complaintService';
import {
  buildActivityEntry,
  fetchActivityLogs,
  persistActivityLog,
} from '../services/activityService';
import {
  clearFirestoreData,
  clearLocalFallbackData,
  resetDemoData,
  isDevResetEnabled,
} from '../services/resetService';
import {
  getFreshItahariSeed,
  seedFreshItahariDemo,
} from '../services/seedService';

const DataContext = createContext(null);

export const DEMO_ADMIN_WARD = 1;

const initialData = getInitialAppData();

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [adminActivity, setAdminActivity] = useState([]);
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
        const [wards, projects, activityLogs] = await Promise.all([
          getWards(),
          getProjects(),
          fetchActivityLogs(),
        ]);
        if (!cancelled) {
          setData((prev) => ({ ...prev, wards, projects }));
          if (activityLogs.length > 0) {
            setAdminActivity(activityLogs);
          }
        }
      } catch (error) {
        console.warn('[WardWatch] Remote data load failed; keeping current local data.', error);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [firebaseEnabled]);

  const logActivity = useCallback((entry) => {
    const record = buildActivityEntry(entry);
    setAdminActivity((prev) => [record, ...prev]);
    persistActivityLog(record).catch((error) => {
      console.warn('[WardWatch] Activity log persist failed.', error);
    });
    return record;
  }, []);

  const addProject = useCallback(async (form, creator = {}) => {
    const result = await addProjectService({
      ...form,
      wardNo: form.wardNo,
      published: true,
      publicVisible: true,
      createdByUid: creator.uid ?? null,
      createdByName: creator.fullName ?? null,
    });
    setData((prev) => ({ ...prev, projects: [result.project, ...prev.projects] }));
    logActivity({
      type: 'project',
      title: 'Project published',
      detail: result.project.title,
      projectId: result.id,
      wardNo: result.project.wardNo,
      userId: creator.uid ?? null,
    });
    return result;
  }, [logActivity]);

  const addUpdate = useCallback(({ projectId, title, description, progressAfter, status, remarks, date, uploadedByUid }) => {
    const progressPercent = Number(progressAfter);
    const updateDate = date || new Date().toISOString().split('T')[0];
    const nextStatus = status || (progressPercent >= 100 ? 'Completed' : undefined);
    let wardNo = null;

    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        wardNo = p.wardNo;
        const resolvedStatus = nextStatus
          ?? (progressPercent >= 100 ? 'Completed' : p.status === 'Planned' ? 'Ongoing' : p.status);
        return {
          ...p,
          progressPercent,
          status: resolvedStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    updateProjectProgress(projectId, {
      progressPercent,
      status: nextStatus,
    }).catch(() => {});

    logActivity({
      type: 'progress',
      title: 'Progress update posted',
      detail: title || `${progressPercent}% — ${remarks || description || 'Progress updated'}`,
      projectId,
      wardNo,
      userId: uploadedByUid ?? null,
      date: updateDate,
    });
    return { label: 'Progress Update', detail: `${progressPercent}% — ${nextStatus || 'status updated'}` };
  }, [logActivity]);

  const addPayment = useCallback(async (payload, actor = {}) => {
    const result = await addPaymentService(payload.projectId, {
      ...payload,
      uploadedByUid: actor.uid ?? payload.uploadedByUid ?? null,
      wardNo: payload.wardNo,
    });
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === result.projectId ? result.project : p)),
    }));
    logActivity({
      type: 'payment',
      title: 'Payment update posted',
      detail: payload.milestone,
      projectId: payload.projectId,
      wardNo: result.project.wardNo,
      userId: actor.uid ?? null,
      date: result.payment.date,
    });
    return { label: 'Payment Release', detail: payload.milestone };
  }, [logActivity]);

  const addProof = useCallback(async (payload, actor = {}) => {
    const result = await addProofService(payload.projectId, {
      ...payload,
      uploadedByUid: actor.uid ?? payload.uploadedByUid ?? null,
      wardNo: payload.wardNo,
    });
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === result.projectId ? result.project : p)),
    }));
    logActivity({
      type: 'proof',
      title: 'Proof uploaded',
      detail: payload.title,
      projectId: payload.projectId,
      wardNo: result.project.wardNo,
      userId: actor.uid ?? null,
      date: result.proof.uploadedAt,
    });
    return { label: 'Proof Upload', detail: payload.title };
  }, [logActivity]);

  const completeProject = useCallback(({ projectId, finalStatus, remarks, proofFile, proofUrl, date, uploadedByUid }) => {
    const completionDate = date || new Date().toISOString().split('T')[0];
    let wardNo = null;

    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        wardNo = p.wardNo;
        const file = proofFile || (proofUrl ? { fileUrl: proofUrl } : null);
        const proofs = file?.fileUrl
          ? [
            ...(p.proofs ?? []),
            {
              id: `proof-${Date.now()}`,
              type: 'after',
              title: `Project completion — ${remarks.slice(0, 40)}`,
              fileUrl: file.fileUrl,
              fileName: file.fileName || null,
              fileType: file.fileType || null,
              fileSize: file.fileSize ?? null,
              url: file.fileUrl,
              uploadedAt: completionDate,
              uploadedBy: uploadedByUid || null,
              remarks,
            },
          ]
          : (p.proofs ?? []);

        return {
          ...p,
          progressPercent: 100,
          status: finalStatus || 'Completed',
          proofs,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    updateProjectProgress(projectId, {
      progressPercent: 100,
      status: finalStatus || 'Completed',
    }).catch(() => {});

    logActivity({
      type: 'project',
      title: 'Project marked complete',
      detail: remarks,
      projectId,
      wardNo,
      userId: uploadedByUid ?? null,
      date: completionDate,
    });
    return { label: 'Completion Update', detail: finalStatus || 'Completed' };
  }, [logActivity]);

  const addComplaint = useCallback(async (form) => {
    const result = await addComplaintService(form, dataRef.current.projects);

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
      wardNo: result.complaint.wardNo,
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

    const project = projects.find((p) => p.id === projectId);
    logActivity({
      type: 'complaint',
      title: 'Complaint response posted',
      detail: `Marked as ${status}`,
      projectId,
      wardNo: project?.wardNo ?? null,
    });
  }, [logActivity]);

  const applyFreshSeed = useCallback((freshSeed) => {
    setData(freshSeed);
    setAdminActivity([]);
  }, []);

  const devClearLocalDemoData = useCallback(async () => {
    const cleared = clearLocalFallbackData();
    applyFreshSeed(getFreshItahariSeed());
    return cleared;
  }, [applyFreshSeed]);

  const devSeedFreshItahariData = useCallback(async () => {
    const result = await seedFreshItahariDemo();
    applyFreshSeed(result.freshSeed);
    return result;
  }, [applyFreshSeed]);

  const devResetAndSeedFreshData = useCallback(async () => {
    const reset = await resetDemoData();
    const seed = await seedFreshItahariDemo();
    applyFreshSeed(seed.freshSeed);
    return { reset, seed };
  }, [applyFreshSeed]);

  const devClearFirestoreOnly = useCallback(async () => clearFirestoreData(), []);

  const value = useMemo(() => {
    const { municipality, wards, projects } = data;
    const publicProjects = getPublicProjects(projects);
    return {
      municipality,
      wards,
      projects,
      publicProjects,
      payments: getAllPayments(publicProjects),
      complaints: getAllComplaints(publicProjects),
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
      isDevResetEnabled,
      devClearLocalDemoData,
      devSeedFreshItahariData,
      devResetAndSeedFreshData,
      devClearFirestoreOnly,
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
    devClearLocalDemoData,
    devSeedFreshItahariData,
    devResetAndSeedFreshData,
    devClearFirestoreOnly,
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
