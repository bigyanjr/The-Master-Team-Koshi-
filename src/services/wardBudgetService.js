import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured, COLLECTIONS } from '../firebase/config';
import { MUNICIPALITY_NAME } from './authService';

// `wardwatch_` (not `wardwatch:`) on purpose — the dev "Reset Demo Data" tool
// (resetService.clearLocalFallbackData) only clears keys with this prefix.
const LOCAL_KEY = 'wardwatch_wardBudgets';

/** Default fiscal year shown when an admin opens the budget form for the first time. */
export const DEFAULT_FISCAL_YEAR = '2082/83';

/**
 * Ward budgets are keyed by municipality + ward + fiscal year so saving never
 * creates a duplicate record — the same key always updates the existing one.
 */
export function buildWardBudgetId(wardNo, fiscalYear) {
  return `${Number(wardNo)}_${String(fiscalYear).trim()}`;
}

function readLocalBudgets() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalBudgets(map) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

/** All ward budget records (any ward, any fiscal year). */
export async function getWardBudgets() {
  if (!isFirebaseConfigured()) {
    return Object.values(readLocalBudgets());
  }

  try {
    const db = getDb();
    if (!db) return Object.values(readLocalBudgets());

    const snap = await getDocs(collection(db, COLLECTIONS.wardBudgets));
    if (snap.empty) return Object.values(readLocalBudgets());
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('[WardWatch] getWardBudgets failed, using local fallback.', error);
    return Object.values(readLocalBudgets());
  }
}

/** Single ward budget record for a specific ward + fiscal year, or null. */
export async function getWardBudget(wardNo, fiscalYear) {
  const id = buildWardBudgetId(wardNo, fiscalYear);

  if (!isFirebaseConfigured()) {
    return readLocalBudgets()[id] ?? null;
  }

  try {
    const db = getDb();
    if (!db) return readLocalBudgets()[id] ?? null;

    const snap = await getDoc(doc(db, COLLECTIONS.wardBudgets, id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return readLocalBudgets()[id] ?? null;
  } catch (error) {
    console.warn('[WardWatch] getWardBudget failed, using local fallback.', error);
    return readLocalBudgets()[id] ?? null;
  }
}

/**
 * Create or update the ward budget for a given ward + fiscal year. Always
 * upserts by the deterministic id (municipality is implied by the app —
 * this demo runs a single municipality) so re-saving never duplicates.
 */
export async function upsertWardBudget(payload) {
  const wardNo = Number(payload.wardNo);
  const fiscalYear = String(payload.fiscalYear || '').trim();
  const id = buildWardBudgetId(wardNo, fiscalYear);

  const existingMap = readLocalBudgets();
  const existing = existingMap[id];

  const record = {
    id,
    municipalityName: payload.municipalityName || MUNICIPALITY_NAME,
    wardNo,
    fiscalYear,
    totalAllocatedBudget: Number(payload.totalAllocatedBudget) || 0,
    budgetTitle: payload.budgetTitle?.trim() || null,
    remarks: payload.remarks?.trim() || null,
    createdBy: existing?.createdBy || payload.createdBy || null,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        await setDoc(doc(db, COLLECTIONS.wardBudgets, id), record, { merge: true });
      }
    } catch (error) {
      console.warn('[WardWatch] upsertWardBudget failed to save to Firestore; kept locally only.', error);
    }
  }

  writeLocalBudgets({ ...existingMap, [id]: record });
  return record;
}

/** Most recently updated budget record for a ward, regardless of fiscal year. */
export function getLatestWardBudget(wardBudgets, wardNo) {
  const matches = wardBudgets.filter((b) => Number(b.wardNo) === Number(wardNo));
  if (matches.length === 0) return null;
  return matches.reduce((latest, b) => (
    new Date(b.updatedAt) > new Date(latest.updatedAt) ? b : latest
  ));
}
