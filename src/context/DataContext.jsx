import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { seedData as initialData } from '../data/seedData';
import { getAllComplaints, getAllPayments } from '../utils/riskEngine';
import { mapFormToProject } from '../services/projectService';
import { mapFormToComplaint } from '../services/complaintService';

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
  const [adminActivity, setAdminActivity] = useState(() => buildSeedAdminActivity(initialData.projects));

  const logActivity = useCallback((entry) => {
    setAdminActivity((prev) => [
      { ...entry, id: nextId('act'), date: entry.date || new Date().toISOString().split('T')[0] },
      ...prev,
    ]);
  }, []);

  const addProject = useCallback((form) => {
    const id = nextId('proj');
    const project = mapFormToProject(form, id);
    setData((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    logActivity({ type: 'project', title: 'Project added', detail: project.title, projectId: id });
    return { id, project };
  }, [logActivity]);

  const addUpdate = useCallback(({ projectId, title, description, progressAfter, status, remarks, postedBy, date }) => {
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

  const addPayment = useCallback(({ projectId, amount, date, milestone, remarks, proofUrl }) => {
    const paymentDate = date || new Date().toISOString().split('T')[0];
    const payment = {
      amount: Number(amount),
      date: paymentDate,
      milestone,
      remarks: remarks || '',
      proofDocumentUrl: proofUrl || null,
    };

    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const proofs = [...(p.proofs ?? [])];
        if (proofUrl) {
          proofs.push({
            type: 'document',
            title: `${milestone} — payment proof`,
            url: proofUrl,
            uploadedAt: paymentDate,
            remarks: remarks || '',
          });
        }
        return {
          ...p,
          payments: [...(p.payments ?? []), payment],
          proofs,
          status: p.status === 'Planned' ? 'Ongoing' : p.status,
        };
      }),
    }));
    logActivity({ type: 'payment', title: 'Payment update posted', detail: milestone, projectId, date: paymentDate });
    return { label: 'Payment Release', detail: milestone };
  }, [logActivity]);

  const addProof = useCallback(({ projectId, title, type, url, uploadedAt, remarks }) => {
    const proofDate = uploadedAt || new Date().toISOString().split('T')[0];
    const proof = {
      type: type || 'during',
      title,
      url: url || `https://placehold.co/800x450/059669/white?text=${encodeURIComponent(title.slice(0, 16))}`,
      uploadedAt: proofDate,
      remarks: remarks || '',
    };
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, proofs: [...(p.proofs ?? []), proof] } : p
      ),
    }));
    logActivity({ type: 'proof', title: 'Proof uploaded', detail: title, projectId, date: proofDate });
    return { label: 'Proof Upload', detail: title };
  }, [logActivity]);

  const completeProject = useCallback(({ projectId, finalStatus, remarks, proofUrl, date }) => {
    const completionDate = date || new Date().toISOString().split('T')[0];
    const proofTitle = `Project completion — ${remarks.slice(0, 40)}`;

    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const proofs = [
          ...(p.proofs ?? []),
          {
            type: 'after',
            title: proofTitle,
            url: proofUrl || `https://placehold.co/800x450/059669/white?text=${encodeURIComponent('Completed')}`,
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

  const addComplaint = useCallback((form) => {
    const id = nextId('comp');
    const complaint = mapFormToComplaint(form, id);

    setData((prev) => {
      if (!form.projectId) return prev;
      return {
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === form.projectId
            ? { ...p, complaints: [complaint, ...(p.complaints ?? [])] }
            : p
        ),
      };
    });

    logActivity({
      type: 'complaint',
      title: 'Citizen feedback submitted',
      detail: complaint.category,
      projectId: form.projectId,
      date: complaint.createdAt,
    });

    return { id, complaint, projectId: form.projectId };
  }, [logActivity]);

  const updateComplaintStatus = useCallback(({ projectId, complaintCreatedAt, status }) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          complaints: (p.complaints ?? []).map((c) =>
            c.createdAt === complaintCreatedAt ? { ...c, status } : c
          ),
        };
      }),
    }));
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
      addProject,
      addUpdate,
      addPayment,
      addProof,
      completeProject,
      addComplaint,
      updateComplaintStatus,
    };
  }, [data, adminActivity, addProject, addUpdate, addPayment, addProof, completeProject, addComplaint, updateComplaintStatus]);

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
