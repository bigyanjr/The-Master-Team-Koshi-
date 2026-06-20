/**
 * Fresh Itahari demo seed for development resets.
 */

import { seedData } from '../data/seedData';
import { isFirebaseConfigured } from '../firebase/config';
import { seedProjectsToFirestore } from './projectService';
import { seedWardsToFirestore } from './wardService';

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Build a deep-cloned fresh Itahari seed with simplified ward labels.
 */
export function getFreshItahariSeed() {
  const municipality = {
    ...seedData.municipality,
    name: 'Itahari Sub-Metropolitan City',
    city: 'Itahari',
    province: 'Koshi Province',
    country: 'Nepal',
    fiscalYear: '2081/82 Demo',
    wards: 5,
  };

  const wards = seedData.wards.map((ward) => ({
    ...ward,
    name: `Ward ${ward.number}`,
  }));

  const projects = cloneJson(seedData.projects).map((project) => ({
    ...project,
    published: true,
    publicVisible: true,
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString(),
  }));

  return { municipality, wards, projects };
}

/**
 * Push fresh seed to Firestore (wards, projects, payments, proofs, complaints).
 */
export async function seedFirestoreData(freshSeed = getFreshItahariSeed()) {
  if (!isFirebaseConfigured()) {
    return {
      mode: 'firestore',
      skipped: true,
      reason: 'Firebase not configured',
    };
  }

  await seedWardsToFirestore(freshSeed.wards);
  await seedProjectsToFirestore(freshSeed.projects);

  return {
    mode: 'firestore',
    skipped: false,
    wards: freshSeed.wards.length,
    projects: freshSeed.projects.length,
  };
}

/**
 * Returns fresh seed object for in-memory / local fallback state.
 */
export function seedLocalData() {
  return getFreshItahariSeed();
}

/**
 * Seed Firestore (if configured) and return fresh in-memory snapshot.
 */
export async function seedFreshItahariDemo() {
  const freshSeed = getFreshItahariSeed();
  const firestore = await seedFirestoreData(freshSeed);

  return {
    freshSeed,
    firestore,
    summary: `${freshSeed.projects.length} projects across ${freshSeed.wards.length} wards`,
  };
}

export const FRESH_PROJECT_TITLES = [
  'Itahari Main Road Repair',
  'Ward 2 Drainage Construction',
  'Street Light Installation at Market Area',
  'Community School Building Maintenance',
  'Public Health Post Upgrade',
  'Drinking Water Pipeline Extension',
  'Waste Management Vehicle Purchase',
  'Community Park Renovation',
  'Footpath Construction Near Bazaar Area',
  'Digital Ward Notice Board Installation',
];
