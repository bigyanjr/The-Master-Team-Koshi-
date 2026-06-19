import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { seedData as initialData } from '../data/seedData';
import { getAllComplaints, getAllPayments } from '../utils/riskEngine';

const DataContext = createContext(null);

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);

  const addProject = useCallback((form) => {
    const id = nextId('proj');
    const project = {
      id,
      wardNo: Number(form.wardNo),
      title: form.title,
      category: form.category,
      allocatedBudget: Number(form.allocatedBudget),
      tenderAmount: Number(form.tenderAmount || form.allocatedBudget),
      contractorName: form.contractorName || null,
      startDate: form.startDate,
      deadline: form.deadline,
      status: form.status || 'Planned',
      progressPercent: 0,
      description: form.description,
      location: form.location,
      coordinates: null,
      payments: [],
      proofs: [],
      complaints: [],
    };
    setData((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    return id;
  }, []);

  const addUpdate = useCallback(({ projectId, title, description, progressAfter, postedBy, date }) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const progressPercent = Number(progressAfter);
        return {
          ...p,
          progressPercent,
          status: progressPercent >= 100 ? 'Completed' : p.status === 'Planned' ? 'Ongoing' : p.status,
          proofs: [
            ...(p.proofs ?? []),
            {
              type: 'during',
              title,
              url: `https://placehold.co/800x450/2563eb/white?text=${encodeURIComponent(title.slice(0, 20))}`,
              uploadedAt: date || new Date().toISOString().split('T')[0],
            },
          ],
        };
      }),
    }));
    return projectId;
  }, []);

  const addComplaint = useCallback((form) => {
    const complaint = {
      citizenName: form.citizenName,
      message: form.message,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setData((prev) => {
      if (form.projectId) {
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === form.projectId
              ? { ...p, complaints: [complaint, ...(p.complaints ?? [])] }
              : p
          ),
        };
      }
      return prev;
    });

    return nextId('comp');
  }, []);

  const value = useMemo(() => {
    const { municipality, wards, projects } = data;
    return {
      municipality,
      wards,
      projects,
      payments: getAllPayments(projects),
      complaints: getAllComplaints(projects),
      addProject,
      addUpdate,
      addComplaint,
    };
  }, [data, addProject, addUpdate, addComplaint]);

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
