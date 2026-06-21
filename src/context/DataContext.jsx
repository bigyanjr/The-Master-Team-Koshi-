import {
  createContext, useContext, useState, useCallback, useMemo, useEffect, useRef,
} from 'react';
import { getInitialAppData } from '../config/demoSeed';
import { getAllComplaints, getAllPayments, aggregateWardStats } from '../utils/riskEngine';
import { getPublicProjects } from '../utils/projectVisibility';
import { isFirebaseConfigured } from '../firebase/config';
import {
  bindLocalStore, readPersistedAppData, writePersistedAppData, PERSISTED_DATA_KEY,
} from '../services/localStore';
import { pushLiveSync } from '../services/liveSyncService';
import {
  getProjects,
  addProject as addProjectService,
  addPayment as addPaymentService,
  addProof as addProofService,
  updateProjectProgress,
} from '../services/projectService';
import { getWards } from '../services/wardService';
import {
  getWardBudgets,
  upsertWardBudget as upsertWardBudgetService,
  getLatestWardBudget,
} from '../services/wardBudgetService';
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

// Rehydrate from whatever an admin already saved locally (same browser,
// any tab) before falling back to the demo seed / empty state. See the
// root-cause note in services/localStore.js — without this, a page refresh
// or a second tab always started from scratch and admin-added data looked
// like it had "disappeared".
const initialData = readPersistedAppData() ?? getInitialAppData();

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Persist every change (project/payment/proof/complaint/update/budget edit
  // all flow through `setData`) so the citizen dashboard — even in a fresh
  // tab or after a refresh — reads the same data the admin just published.
  useEffect(() => {
    writePersistedAppData(data);
  }, [data]);

  // Also push to the dev-server live-sync endpoint (see liveSyncService.js)
  // so a QR already open on a *different device* (a phone with no access
  // to this browser's localStorage) can pick up the change too — that's
  // what makes scans update without re-scanning. Best-effort: no-ops
  // harmlessly outside the Vite dev server (e.g. a production build).
  useEffect(() => {
    pushLiveSync(data);
  }, [data]);

  // ROOT CAUSE (stale QR / "still has same" bug): each browser tab keeps its
  // own React state, hydrated once from localStorage at mount. The write
  // above keeps storage current, but nothing told an *already-open* tab
  // (e.g. one previewing a project's QR code) that a different tab just
  // added a payment or project — so it kept rendering whatever it loaded at
  // mount, and any QR generated from it stayed stale. The browser's native
  // `storage` event fires in every other tab whenever localStorage changes,
  // so listening for it here keeps every open tab of this app in sync
  // without needing a manual refresh.
  useEffect(() => {
    function handleStorageSync(event) {
      if (event.key !== PERSISTED_DATA_KEY || !event.newValue) return;
      const fresh = readPersistedAppData();
      if (fresh) setData(fresh);
    }
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const [adminActivity, setAdminActivity] = useState([]);
  const [wardBudgets, setWardBudgets] = useState([]);
  const [dataLoading, setDataLoading] = useState(isFirebaseConfigured());
  const firebaseEnabled = isFirebaseConfigured();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const budgets = await getWardBudgets();
      if (!cancelled) setWardBudgets(budgets);
    })();
    return () => { cancelled = true; };
  }, []);

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

  const saveWardBudget = useCallback(async (payload, actor = {}) => {
    const record = await upsertWardBudgetService({
      ...payload,
      createdBy: actor.uid ?? payload.createdBy ?? null,
    });
    setWardBudgets((prev) => {
      const next = prev.filter((b) => b.id !== record.id);
      next.push(record);
      return next;
    });
    logActivity({
      type: 'budget',
      title: 'Ward budget updated',
      detail: `${record.fiscalYear} — ${record.totalAllocatedBudget}`,
      wardNo: record.wardNo,
      userId: actor.uid ?? null,
    });
    return record;
  }, [logActivity]);

  /**
   * Single source of truth for ward budget numbers — used by both the admin
   * dashboard and the citizen dashboard so they never show different figures.
   */
  const getWardBudgetSummary = useCallback((wardNo) => {
    const publicProjects = getPublicProjects(dataRef.current.projects);
    const stats = aggregateWardStats(Number(wardNo), publicProjects);
    const budgetRecord = getLatestWardBudget(wardBudgets, wardNo);
    const totalAllocatedBudget = budgetRecord?.totalAllocatedBudget ?? 0;
    const wardExpenditure = stats.totalSpent;
    const remainingBudget = Math.max(0, totalAllocatedBudget - wardExpenditure);
    const spentPercentage = totalAllocatedBudget > 0
      ? Math.min(100, Math.round((wardExpenditure / totalAllocatedBudget) * 100))
      : 0;

    return {
      budgetRecord,
      isPublished: Boolean(budgetRecord),
      totalAllocatedBudget,
      wardExpenditure,
      remainingBudget,
      projectCount: stats.projectCount,
      spentPercentage,
    };
    // `data` (projects/payments) is read via dataRef.current above so this
    // stays correct even mid-render, but it must still be a dependency here
    // so the function's identity changes whenever projects change — otherwise
    // components that memoize on this callback (e.g. `useMemo(() =>
    // getWardBudgetSummary(wardNo), [getWardBudgetSummary, wardNo])`) would
    // keep returning a stale expenditure/remaining figure after a new
    // payment is posted, until wardBudgets happened to change too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardBudgets, data]);

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
      wardBudgets,
      saveWardBudget,
      getWardBudgetSummary,
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
    wardBudgets,
    saveWardBudget,
    getWardBudgetSummary,
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
