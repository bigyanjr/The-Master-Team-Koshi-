import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { COLLECTIONS, getDb, isFirebaseConfigured } from '../firebase/config';
import { generateEntityId } from './projectService';

export function buildActivityEntry({
  type,
  title,
  detail,
  projectId = null,
  wardNo = null,
  userId = null,
  date = null,
}) {
  const now = new Date().toISOString();
  return {
    id: generateEntityId('act'),
    type,
    title,
    detail,
    projectId,
    wardNo: wardNo != null ? Number(wardNo) : null,
    userId,
    date: date || now.split('T')[0],
    createdAt: now,
  };
}

export async function persistActivityLog(entry) {
  if (!isFirebaseConfigured()) return entry;

  const db = getDb();
  if (!db) return entry;

  await setDoc(doc(db, COLLECTIONS.activityLogs, entry.id), entry);
  return entry;
}

export async function fetchActivityLogs() {
  if (!isFirebaseConfigured()) return [];

  try {
    const db = getDb();
    if (!db) return [];

    const snapshot = await getDocs(collection(db, COLLECTIONS.activityLogs));
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  } catch (error) {
    console.warn('[WardWatch] Firestore activityLogs fetch failed.', error);
    return [];
  }
}
