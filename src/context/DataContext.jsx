import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { seedData as initialData } from '../data/seedData';

const DataContext = createContext(null);

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);

  const addProject = useCallback((project) => {
    const id = nextId('proj');
    setData((prev) => ({
      ...prev,
      projects: [{ ...project, id, status: project.status || 'pending', progress: project.progress ?? 0 }, ...prev.projects],
    }));
    return id;
  }, []);

  const addUpdate = useCallback((update) => {
    const id = nextId('upd');
    setData((prev) => {
      const projects = prev.projects.map((p) =>
        p.id === update.projectId
          ? { ...p, progress: update.progressAfter ?? p.progress, status: update.progressAfter >= 100 ? 'completed' : p.status === 'pending' ? 'in-progress' : p.status }
          : p
      );
      return {
        ...prev,
        projects,
        updates: [{ ...update, id, date: update.date || new Date().toISOString().split('T')[0] }, ...prev.updates],
      };
    });
    return id;
  }, []);

  const addComplaint = useCallback((complaint) => {
    const id = nextId('comp');
    setData((prev) => ({
      ...prev,
      complaints: [{ ...complaint, id, date: complaint.date || new Date().toISOString().split('T')[0], status: 'open' }, ...prev.complaints],
    }));
    return id;
  }, []);

  const value = useMemo(
    () => ({ ...data, addProject, addUpdate, addComplaint }),
    [data, addProject, addUpdate, addComplaint]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// Firebase-ready hook point — swap implementation when backend is connected
export function useDataStore() {
  return useData();
}
