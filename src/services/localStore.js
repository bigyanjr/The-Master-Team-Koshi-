import { seedData } from '../data/seedData';

/** @type {{ getSnapshot: () => object, setProjects: (updater: function) => void } | null} */
let store = null;

export function bindLocalStore(next) {
  store = next;
}

export function getLocalSnapshot() {
  return store?.getSnapshot() ?? seedData;
}

export function getLocalProjects() {
  return getLocalSnapshot().projects ?? seedData.projects;
}

export function getLocalWards() {
  return getLocalSnapshot().wards ?? seedData.wards;
}

export function setLocalProjects(updater) {
  if (store?.setProjects) {
    store.setProjects(updater);
  }
}
