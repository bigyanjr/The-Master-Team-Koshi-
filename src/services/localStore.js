import { createEmptyAppData, buildEmptyWards } from '../data/initialData';
import { isDemoSeedEnabled } from '../config/demoSeed';
import { seedData } from '../data/seedData';

/** @type {{ getSnapshot: () => object, setProjects: (updater: function) => void } | null} */
let store = null;

function getFallbackSnapshot() {
  if (isDemoSeedEnabled()) return seedData;
  return createEmptyAppData();
}

export function bindLocalStore(next) {
  store = next;
}

export function getLocalSnapshot() {
  return store?.getSnapshot() ?? getFallbackSnapshot();
}

export function getLocalProjects() {
  return getLocalSnapshot().projects ?? [];
}

export function getLocalWards() {
  return getLocalSnapshot().wards ?? buildEmptyWards();
}

export function setLocalProjects(updater) {
  if (store?.setProjects) {
    store.setProjects(updater);
  }
}
