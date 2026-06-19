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

export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@itahari.demo',
    password: 'demo123',
    profile: {
      fullName: 'Demo Citizen',
      role: ROLES.PUBLIC,
      wardNo: null,
      phone: '9800000001',
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
  return {
    uid,
    fullName: data.fullName?.trim() || '',
    email: normalizeEmail(data.email),
    role: data.role === ROLES.WARD_ADMIN ? ROLES.WARD_ADMIN : ROLES.PUBLIC,
    wardNo: data.role === ROLES.WARD_ADMIN ? Number(data.wardNo) || null : null,
    phone: data.phone?.trim() || null,
    createdAt: data.createdAt || nowIso(),
    photoURL: data.photoURL || null,
  };
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
  return copy;
}

async function localRegister({ fullName, email, password, role, wardNo, phone }) {
  seedLocalDemoUsers();

  if (findLocalUserByEmail(email)) {
    const err = new Error('An account with this email already exists.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const uid = generateUid();
  const profile = buildProfile(uid, {
    fullName,
    email,
    role,
    wardNo,
    phone,
  });

  const users = readLocalUsers();
  users.push({ ...profile, password });
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
  return { uid, ...snap.data() };
}

async function firebaseSaveProfile(uid, profile) {
  const db = getDb();
  if (!db) return profile;
  await setDoc(doc(db, COLLECTIONS.users, uid), profile, { merge: true });
  return profile;
}

async function firebaseRegister({ fullName, email, password, role, wardNo, phone }) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured');

  const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
  await firebaseUpdateProfile(cred.user, { displayName: fullName.trim() });

  const profile = buildProfile(cred.user.uid, {
    fullName,
    email,
    role,
    wardNo,
    phone,
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

export function validateRegistration({ fullName, email, password, confirmPassword, role, wardNo }) {
  const errors = {};

  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (role === ROLES.WARD_ADMIN && !wardNo) {
    errors.wardNo = 'Ward number is required for ward admin accounts';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export async function registerUser(payload) {
  if (isFirebaseConfigured()) {
    return firebaseRegister(payload);
  }
  return localRegister(payload);
}

export async function loginUser(email, password) {
  if (isFirebaseConfigured()) {
    return firebaseLogin(email, password);
  }
  return localLogin(email, password);
}

export async function loginDemoAccount(type) {
  const account = DEMO_ACCOUNTS[type];
  if (!account) throw new Error('Unknown demo account');
  return loginUser(account.email, account.password);
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

export function getPostLoginPath(profile) {
  return isWardAdmin(profile) ? '/admin' : '/dashboard';
}
