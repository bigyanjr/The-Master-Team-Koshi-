import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured, COLLECTIONS } from '../firebase/config';

const SITE_SETTINGS_DOC_ID = 'site';
const LOCAL_KEY = 'wardwatch:siteSettings';

/** Default settings used until a ward admin configures something different. */
export const DEFAULT_SITE_SETTINGS = {
  heroImageUrl: '/home.jpg',
};

function readLocalSettings() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SITE_SETTINGS };
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

function writeLocalSettings(next) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

/**
 * Site-wide settings (currently: the public home page hero image), editable
 * by ward office admins from /admin/settings. Backed by Firestore when
 * configured, otherwise falls back to localStorage for the demo/local mode.
 */
export async function getSiteSettings() {
  if (!isFirebaseConfigured()) {
    return readLocalSettings();
  }

  try {
    const db = getDb();
    if (!db) return readLocalSettings();

    const snap = await getDoc(doc(db, COLLECTIONS.settings, SITE_SETTINGS_DOC_ID));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...snap.data() };
    }
    return readLocalSettings();
  } catch (error) {
    console.warn('[WardWatch] getSiteSettings failed, using local fallback.', error);
    return readLocalSettings();
  }
}

export async function updateSiteSettings(partial) {
  const current = await getSiteSettings();
  const merged = { ...current, ...partial };

  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        await setDoc(doc(db, COLLECTIONS.settings, SITE_SETTINGS_DOC_ID), merged, { merge: true });
      }
    } catch (error) {
      console.warn('[WardWatch] updateSiteSettings failed to save to Firestore; kept locally only.', error);
    }
  }

  writeLocalSettings(merged);
  return merged;
}
