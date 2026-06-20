import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const COLLECTIONS = {
  wards: 'wards',
  projects: 'projects',
  payments: 'payments',
  proofs: 'proofs',
  complaints: 'complaints',
  users: 'users',
  activityLogs: 'activityLogs',
  aiFeedback: 'aiFeedback',
  bookmarks: 'bookmarks',
  settings: 'settings',
};

/**
 * True when all required Vite env vars are present (no hardcoded keys).
 */
export function isFirebaseConfigured() {
  const env = import.meta.env;
  return Boolean(
    env.VITE_FIREBASE_API_KEY
    && env.VITE_FIREBASE_AUTH_DOMAIN
    && env.VITE_FIREBASE_PROJECT_ID
    && env.VITE_FIREBASE_STORAGE_BUCKET
    && env.VITE_FIREBASE_MESSAGING_SENDER_ID
    && env.VITE_FIREBASE_APP_ID,
  );
}

function readFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

let firebaseApp = null;
let firestoreDb = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(readFirebaseConfig());
  }
  return firebaseApp;
}

export function getDb() {
  if (!isFirebaseConfigured()) return null;
  if (!firestoreDb) {
    const app = getFirebaseApp();
    if (app) firestoreDb = getFirestore(app);
  }
  return firestoreDb;
}
