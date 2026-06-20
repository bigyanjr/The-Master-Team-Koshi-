import { seedData } from '../data/seedData';
import { createEmptyAppData } from '../data/initialData';

/** True only when VITE_USE_DEMO_SEED=true (local development helper). */
export function isDemoSeedEnabled() {
  return import.meta.env.VITE_USE_DEMO_SEED === 'true';
}

export function getInitialAppData() {
  if (isDemoSeedEnabled()) {
    return {
      municipality: seedData.municipality,
      wards: seedData.wards,
      projects: [...seedData.projects],
    };
  }
  return createEmptyAppData();
}
