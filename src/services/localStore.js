import { createEmptyAppData, buildEmptyWards } from '../data/initialData';
import { isDemoSeedEnabled } from '../config/demoSeed';
import { seedData } from '../data/seedData';

/** @type {{ getSnapshot: () => object, setProjects: (updater: function) => void } | null} */
let store = null;

/**
 * ROOT CAUSE (main data-flow bug): no Firebase project is configured in this
 * app (no VITE_FIREBASE_* vars in .env), so `isFirebaseConfigured()` is false
 * everywhere and this localStorage fallback IS the only "database" the app
 * has. Admin actions (addProject, addPayment, addProof, addComplaint,
 * addUpdate) only ever called `setData` on the in-memory React state inside
 * DataContext — nothing was ever written to storage. So the moment the tab
 * was refreshed, or the citizen opened the site in a different tab/browser,
 * the admin's data was gone, because it never existed anywhere outside that
 * one React state instance.
 *
 * `wardwatch_appData` is the fix: DataContext now persists `data` here on
 * every change, and rehydrates from it on load instead of always starting
 * from the empty/demo seed. The key uses the `wardwatch_` prefix (not
 * `wardwatch:`) on purpose, so the existing "Reset Demo Data" dev tool —
 * which only clears keys starting with `wardwatch_` — actually wipes it too.
 */
export const PERSISTED_DATA_KEY = 'wardwatch_appData';

export function readPersistedAppData() {
  try {
    const raw = window.localStorage.getItem(PERSISTED_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Bigger than this and a base64 photo/PDF risks blowing the whole
// localStorage quota by itself (browsers typically allow ~5-10MB per
// origin TOTAL, and base64 inflates a file's size by ~33%).
const MAX_INLINE_DATA_URL_LENGTH = 20000;

/** Recursively replace any oversized inline `data:` URL with null. */
function stripOversizedDataUrls(value) {
  if (Array.isArray(value)) return value.map(stripOversizedDataUrls);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, stripOversizedDataUrls(v)]),
    );
  }
  if (typeof value === 'string' && value.startsWith('data:') && value.length > MAX_INLINE_DATA_URL_LENGTH) {
    return null;
  }
  return value;
}

/**
 * ROOT CAUSE (citizen feedback/evidence "disappearing" on refresh): with no
 * real backend, every uploaded photo becomes a base64 `data:` URL embedded
 * directly inside this same app-data blob. A single sizable photo can push
 * the whole blob past the browser's localStorage quota — `setItem` then
 * throws a QuotaExceededError, which used to be silently swallowed, so the
 * ENTIRE save failed (not just the new complaint/proof, everything since
 * the last successful save). On the next refresh, `readPersistedAppData`
 * had no choice but to fall back to that older snapshot — the new feedback
 * looked like it had vanished.
 *
 * Fix: if the save fails, retry once with oversized inline attachments
 * stripped out. That keeps the actual data (the complaint text, category,
 * status, payment amounts, etc.) safely persisted — only the embedded image
 * itself is dropped, instead of losing everything.
 */
export function writePersistedAppData(data) {
  try {
    window.localStorage.setItem(PERSISTED_DATA_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (err) {
    try {
      window.localStorage.setItem(PERSISTED_DATA_KEY, JSON.stringify(stripOversizedDataUrls(data)));
      console.warn(
        '[WardWatch] Storage quota exceeded — saved without one or more large attachments. '
        + 'Try a smaller image next time.',
        err,
      );
      return { ok: true, mediaDropped: true };
    } catch (err2) {
      console.warn('[WardWatch] Could not persist app data even after dropping large attachments.', err2);
      return { ok: false };
    }
  }
}

function getFallbackSnapshot() {
  const persisted = readPersistedAppData();
  if (persisted) return persisted;
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
