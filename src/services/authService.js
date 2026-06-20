import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseApp, getDb, isFirebaseConfigured, COLLECTIONS } from '../firebase/config';

export const ROLES = {
  PUBLIC: 'public',
  WARD_ADMIN: 'ward_admin',
};

/** Hackathon demo — in production, ward admins require municipality approval before access. */
export const MUNICIPALITY_NAME = 'Itahari Sub-Metropolitan City';

export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@itahari.demo',
    password: 'demo123',
    profile: {
      fullName: 'Demo Citizen',
      role: ROLES.PUBLIC,
      wardNo: null,
      phone: '9800000001',
      approved: true,
      municipality: MUNICIPALITY_NAME,
    },
  },
  admin: {
    email: 'admin@itahari.demo',
    password: 'demo123',
    profile: {
      fullName: 'Ward IT Admin',
      role: ROLES.WARD_ADMIN,
      wardNo: 1,
      phone: '9800000002',
      positionTitle: 'Ward IT Officer',
      municipality: MUNICIPALITY_NAME,
      approved: true,
      status: 'approved',
    },
  },
};

const LOCAL_USERS_KEY = 'wardwatch_local_users';
const LOCAL_SESSION_KEY = 'wardwatch_local_session';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function generateUid() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildProfile(uid, data) {
  const role = data.role === ROLES.WARD_ADMIN ? ROLES.WARD_ADMIN : ROLES.PUBLIC;
  const wardRaw = data.wardNo;
  const wardNo = wardRaw != null && wardRaw !== '' ? Number(wardRaw) : null;

  const profile = {
    uid,
    fullName: data.fullName?.trim() || '',
    email: normalizeEmail(data.email || ''),
    role,
    wardNo: Number.isFinite(wardNo) ? wardNo : null,
    phone: data.phone?.trim() || null,
    municipality: data.municipality || MUNICIPALITY_NAME,
    approved: data.approved !== false,
    createdAt: data.createdAt || nowIso(),
    photoURL: data.photoURL || null,
  };

  if (role === ROLES.WARD_ADMIN) {
    profile.positionTitle = data.positionTitle?.trim() || null;
    profile.status = data.status || (profile.approved ? 'approved' : 'pending');
  }

  return profile;
}

function normalizeStoredProfile(uid, data) {
  if (!data) return null;
  return buildProfile(uid, data);
}

function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/* ─── Local demo auth ─── */

function readLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function readLocalSessionUid() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw)?.uid : null;
  } catch {
    return null;
  }
}

function writeLocalSession(uid) {
  if (uid) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ uid }));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

function seedLocalDemoUsers() {
  const users = readLocalUsers();
  const next = [...users];
  let changed = false;

  Object.values(DEMO_ACCOUNTS).forEach(({ email, password, profile }) => {
    const normalized = normalizeEmail(email);
    const existing = next.find((u) => normalizeEmail(u.email) === normalized);
    if (!existing) {
      const uid = generateUid();
      next.push({
        uid,
        email: normalized,
        password,
        ...buildProfile(uid, { email: normalized, ...profile }),
      });
      changed = true;
    }
  });

  if (changed) {
    writeLocalUsers(next);
  }

  return next;
}

function findLocalUserByEmail(email) {
  const users = seedLocalDemoUsers();
  return users.find((u) => normalizeEmail(u.email) === normalizeEmail(email)) ?? null;
}

function findLocalUserByUid(uid) {
  const users = seedLocalDemoUsers();
  return users.find((u) => u.uid === uid) ?? null;
}

function stripPassword(user) {
  if (!user) return null;
  const copy = { ...user };
  delete copy.password;
  return normalizeStoredProfile(copy.uid, copy);
}

async function localRegister(payload) {
  seedLocalDemoUsers();

  if (findLocalUserByEmail(payload.email)) {
    const err = new Error('An account with this email already exists.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const uid = generateUid();
  const isWardAdmin = payload.role === ROLES.WARD_ADMIN;

  const profile = buildProfile(uid, {
    fullName: payload.fullName,
    email: payload.email,
    role: isWardAdmin ? ROLES.WARD_ADMIN : ROLES.PUBLIC,
    wardNo: isWardAdmin ? payload.wardNo : payload.wardNo || null,
    phone: payload.phone,
    positionTitle: payload.positionTitle,
    municipality: MUNICIPALITY_NAME,
    approved: true,
    status: isWardAdmin ? 'approved' : undefined,
  });

  const users = readLocalUsers();
  users.push({ ...profile, password: payload.password });
  writeLocalUsers(users);
  writeLocalSession(uid);

  return profile;
}

async function localLogin(email, password) {
  seedLocalDemoUsers();
  const user = findLocalUserByEmail(email);

  if (!user || user.password !== password) {
    const err = new Error('Invalid email or password.');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  writeLocalSession(user.uid);
  return stripPassword(user);
}

async function localLogout() {
  writeLocalSession(null);
}

async function localGetCurrentProfile() {
  const uid = readLocalSessionUid();
  if (!uid) return null;
  return stripPassword(findLocalUserByUid(uid));
}

function localSubscribe(callback) {
  seedLocalDemoUsers();
  callback(stripPassword(findLocalUserByUid(readLocalSessionUid() ?? '')));

  const onStorage = (e) => {
    if (e.key === LOCAL_SESSION_KEY || e.key === LOCAL_USERS_KEY) {
      localGetCurrentProfile().then(callback);
    }
  };

  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

/* ─── Firebase auth ─── */

async function firebaseFetchProfile(uid) {
  const db = getDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  return normalizeStoredProfile(uid, snap.data());
}

async function firebaseSaveProfile(uid, profile) {
  const db = getDb();
  if (!db) return profile;
  await setDoc(doc(db, COLLECTIONS.users, uid), profile, { merge: true });
  return profile;
}

async function firebaseRegister(payload) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured');

  const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(payload.email), payload.password);
  await firebaseUpdateProfile(cred.user, { displayName: payload.fullName.trim() });

  const isWardAdmin = payload.role === ROLES.WARD_ADMIN;
  const profile = buildProfile(cred.user.uid, {
    fullName: payload.fullName,
    email: payload.email,
    role: isWardAdmin ? ROLES.WARD_ADMIN : ROLES.PUBLIC,
    wardNo: isWardAdmin ? payload.wardNo : payload.wardNo || null,
    phone: payload.phone,
    positionTitle: payload.positionTitle,
    municipality: MUNICIPALITY_NAME,
    approved: true,
    status: isWardAdmin ? 'approved' : undefined,
    photoURL: cred.user.photoURL,
  });

  await firebaseSaveProfile(cred.user.uid, profile);
  return profile;
}

async function firebaseLogin(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured');

  const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  let profile = await firebaseFetchProfile(cred.user.uid);

  if (!profile) {
    profile = buildProfile(cred.user.uid, {
      fullName: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      email: cred.user.email,
      role: ROLES.PUBLIC,
      wardNo: null,
      phone: null,
      municipality: MUNICIPALITY_NAME,
      approved: true,
      photoURL: cred.user.photoURL,
    });
    await firebaseSaveProfile(cred.user.uid, profile);
  }

  return profile;
}

async function firebaseLogout() {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

function firebaseSubscribe(callback) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    try {
      let profile = await firebaseFetchProfile(user.uid);
      if (!profile) {
        profile = buildProfile(user.uid, {
          fullName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: ROLES.PUBLIC,
          wardNo: null,
          phone: null,
          municipality: MUNICIPALITY_NAME,
          approved: true,
          photoURL: user.photoURL,
        });
        await firebaseSaveProfile(user.uid, profile);
      }
      callback(profile);
    } catch (error) {
      console.warn('[WardWatch Auth] Profile load failed', error);
      callback(null);
    }
  });
}

/* ─── Public API ─── */

export function isAuthConfigured() {
  return isFirebaseConfigured();
}

export function validateRegistration({
  fullName, email, password, confirmPassword, role, wardNo, phone,
}) {
  const errors = {};

  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (role === ROLES.WARD_ADMIN) {
    if (!phone?.trim()) errors.phone = 'Phone is required for ward admin accounts';
    if (!wardNo) errors.wardNo = 'Ward number is required';
  }

  if (wardNo) {
    const n = Number(wardNo);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      errors.wardNo = 'Select a valid ward (1–5)';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export async function registerUser(payload) {
  const isWardAdmin = payload.role === ROLES.WARD_ADMIN;

  const safePayload = {
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    role: isWardAdmin ? ROLES.WARD_ADMIN : ROLES.PUBLIC,
    wardNo: isWardAdmin ? payload.wardNo : payload.wardNo || null,
    positionTitle: isWardAdmin ? payload.positionTitle : null,
  };

  if (isFirebaseConfigured()) {
    return firebaseRegister(safePayload);
  }
  return localRegister(safePayload);
}

export async function loginUser(email, password) {
  if (isFirebaseConfigured()) {
    return firebaseLogin(email, password);
  }
  return localLogin(email, password);
}

export async function logoutUser() {
  if (isFirebaseConfigured()) {
    return firebaseLogout();
  }
  return localLogout();
}

export async function getCurrentProfile() {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) return null;
    return firebaseFetchProfile(user.uid);
  }
  return localGetCurrentProfile();
}

export function subscribeToAuth(callback) {
  if (isFirebaseConfigured()) {
    return firebaseSubscribe(callback);
  }
  return localSubscribe(callback);
}

export function isWardAdmin(profile) {
  return profile?.role === ROLES.WARD_ADMIN;
}

export function isApprovedWardAdmin(profile) {
  return profile?.role === ROLES.WARD_ADMIN
    && profile?.approved === true
    && profile?.wardNo != null;
}

export function canAccessAdminPortal(profile) {
  return isApprovedWardAdmin(profile);
}

export function validatePostLogin(profile) {
  if (profile?.role === ROLES.WARD_ADMIN) {
    if (!profile.wardNo) {
      return {
        ok: false,
        error: 'Your ward admin profile is incomplete. Please select or contact support.',
      };
    }
    if (profile.approved !== true) {
      return {
        ok: false,
        error: 'Your ward admin account is not yet approved.',
      };
    }
    return { ok: true, path: '/admin' };
  }

  return { ok: true, path: '/dashboard' };
}

export function getPostLoginPath(profile) {
  return validatePostLogin(profile).path || '/dashboard';
}

export function getRegistrationSuccessMessage(profile) {
  if (profile?.role === ROLES.WARD_ADMIN) {
    return `Ward IT/Admin account created successfully. You are now managing Ward ${profile.wardNo} records.`;
  }
  return 'Citizen account created successfully.';
}

export function assertWardProjectAccess(profile, project) {
  if (!isApprovedWardAdmin(profile)) return false;
  return project?.wardNo === profile.wardNo;
}

export function filterProjectsForAdmin(projects, profile) {
  if (!isApprovedWardAdmin(profile) || !profile.wardNo) return [];
  return projects.filter((p) => p.wardNo === profile.wardNo);
}

export function filterComplaintsForAdmin(projects, profile) {
  const wardProjects = filterProjectsForAdmin(projects, profile);
  const wardProjectIds = new Set(wardProjects.map((p) => p.id));
  return projects.flatMap((p) =>
    (p.complaints ?? [])
      .filter(() => wardProjectIds.has(p.id))
      .map((c) => ({
        ...c,
        projectId: p.id,
        projectTitle: p.title,
        wardNo: p.wardNo,
      })),
  );
}

export function filterActivityForAdmin(activity, projects, profile) {
  const wardProjectIds = new Set(filterProjectsForAdmin(projects, profile).map((p) => p.id));
  return activity.filter((a) => !a.projectId || wardProjectIds.has(a.projectId));
}
