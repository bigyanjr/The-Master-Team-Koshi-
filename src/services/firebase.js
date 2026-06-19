/**
 * Firebase integration placeholder.
 * When ready, install firebase and replace local DataContext with Firestore sync.
 *
 * Expected collections:
 *   municipalities, wards, projects, payments, proofs, updates, complaints, contractors, tenders
 */

export const FIREBASE_CONFIG = {
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

export const COLLECTIONS = {
  projects: 'projects',
  payments: 'payments',
  proofs: 'proofs',
  updates: 'updates',
  complaints: 'complaints',
  wards: 'wards',
  contractors: 'contractors',
  tenders: 'tenders',
};
