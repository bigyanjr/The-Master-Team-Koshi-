import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured, COLLECTIONS } from '../firebase/config';
import { getLocalWards } from './localStore';
import { seedData } from '../data/seedData';
import { buildEmptyWards } from '../data/initialData';
import { isDemoSeedEnabled } from '../config/demoSeed';
import { normalizeWardList } from '../constants/wards';

function getDefaultWards() {
  return isDemoSeedEnabled() ? seedData.wards : buildEmptyWards();
}

export async function getWards() {
  if (!isFirebaseConfigured()) {
    return normalizeWardList(getLocalWards());
  }

  try {
    const db = getDb();
    if (!db) return normalizeWardList(getDefaultWards());

    const snapshot = await getDocs(collection(db, COLLECTIONS.wards));
    const wards = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

    return normalizeWardList(wards.length > 0 ? wards : getDefaultWards());
  } catch (error) {
    console.warn('[WardWatch] Firestore getWards failed, using local ward list.', error);
    return normalizeWardList(getLocalWards());
  }
}

/**
 * Seed Firestore wards collection from demo data (optional admin/setup helper).
 */
export async function seedWardsToFirestore(wards = seedData.wards) {
  if (!isFirebaseConfigured()) return false;

  const db = getDb();
  if (!db) return false;

  await Promise.all(
    wards.map((ward) => setDoc(doc(db, COLLECTIONS.wards, ward.id), ward, { merge: true })),
  );
  return true;
}
