/**
 * Development-only demo data reset utilities.
 * Never call automatically in production builds.
 */

import {
  collection, getDocs, writeBatch,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured, COLLECTIONS } from '../firebase/config';
import { clearLocalAuthStorage } from './authService';

const RESET_COLLECTIONS = [
  COLLECTIONS.users,
  COLLECTIONS.wards,
  COLLECTIONS.projects,
  COLLECTIONS.payments,
  COLLECTIONS.proofs,
  COLLECTIONS.complaints,
  COLLECTIONS.activityLogs,
  COLLECTIONS.aiFeedback,
  COLLECTIONS.bookmarks,
];

const LOCAL_STORAGE_PREFIX = 'wardwatch_';

/** True in Vite dev server or when explicitly enabled via env. */
export function isDevResetEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_RESET === 'true';
}

export function assertDevResetAllowed() {
  if (!isDevResetEnabled()) {
    throw new Error('Demo reset is disabled. Enable only in development or with VITE_ENABLE_DEV_RESET=true.');
  }
}

async function deleteCollectionDocs(db, collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      return { collection: collectionName, deleted: 0, skipped: false };
    }

    const docs = snapshot.docs;
    let deleted = 0;

    for (let i = 0; i < docs.length; i += 450) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + 450);
      chunk.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      deleted += chunk.length;
    }

    return { collection: collectionName, deleted, skipped: false };
  } catch (error) {
    console.warn(`[WardWatch Reset] Could not clear "${collectionName}":`, error);
    return {
      collection: collectionName,
      deleted: 0,
      skipped: true,
      error: error?.message || String(error),
    };
  }
}

/**
 * Delete all documents in configured Firestore collections.
 * Does NOT delete Firebase Authentication users (requires Console or Admin SDK).
 */
export async function clearFirestoreData() {
  assertDevResetAllowed();

  if (!isFirebaseConfigured()) {
    return { mode: 'firestore', skipped: true, reason: 'Firebase not configured', results: [] };
  }

  const db = getDb();
  if (!db) {
    return { mode: 'firestore', skipped: true, reason: 'Firestore unavailable', results: [] };
  }

  const results = [];
  for (const name of RESET_COLLECTIONS) {
    results.push(await deleteCollectionDocs(db, name));
  }

  return { mode: 'firestore', skipped: false, results };
}

/**
 * Clear WardWatch local fallback: auth cache and wardwatch_* localStorage keys.
 */
export function clearLocalFallbackData() {
  assertDevResetAllowed();

  clearLocalAuthStorage();

  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  return {
    mode: 'local',
    clearedKeys: keysToRemove,
    note: 'Local demo users, session, and wardwatch_* keys removed.',
  };
}

/**
 * Full demo reset: Firestore collections + local fallback.
 * Does not seed — call seedFreshItahariDemo() separately or use resetAndSeedFreshData().
 */
export async function resetDemoData() {
  assertDevResetAllowed();

  const local = clearLocalFallbackData();
  const firestore = await clearFirestoreData();

  return {
    local,
    firestore,
    authNote: 'Firebase Authentication users were NOT deleted. Remove them manually in Firebase Console → Authentication → Users.',
  };
}

export async function resetAndSeedFreshData(seedFn) {
  const resetResult = await resetDemoData();
  const seedResult = await seedFn();
  return { reset: resetResult, seed: seedResult };
}

export const FIREBASE_AUTH_RESET_NOTE =
  'Delete Authentication users from Firebase Console → Authentication → Users. Client apps cannot safely delete Auth users.';

export const FIREBASE_STORAGE_RESET_NOTE =
  'Delete uploaded files manually from Firebase Console → Storage if you need a fully clean demo.';
