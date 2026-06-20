const LEGACY_DATA_KEYS = [
  'wardwatch_projects',
  'wardwatch_local_data',
  'wardwatch_app_data',
  'wardwatch_seed',
  'wardwatch_seed_version',
];

const PRESERVED_KEYS = new Set([
  'wardwatch_local_users',
  'wardwatch_local_session',
  'wardwatch_bookmarks',
]);

const DEMO_PROJECT_MARKERS = ['proj-ith-01', 'proj-ith-02', 'Koshi Highway Builders'];

function keyContainsDemoProjects(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    return DEMO_PROJECT_MARKERS.some((marker) => raw.includes(marker));
  } catch {
    return false;
  }
}

/**
 * Remove WardWatch localStorage keys that cache old seeded demo projects.
 * Preserves auth session and bookmark keys.
 */
export function clearLegacyDemoData() {
  const removed = [];

  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('wardwatch_')) continue;
    if (PRESERVED_KEYS.has(key)) continue;

    const shouldRemove = LEGACY_DATA_KEYS.includes(key) || keyContainsDemoProjects(key);
    if (shouldRemove) {
      localStorage.removeItem(key);
      removed.push(key);
    }
  }

  if (removed.length > 0) {
    console.info('[WardWatch] Cleared legacy demo data keys:', removed);
  }

  return removed;
}
