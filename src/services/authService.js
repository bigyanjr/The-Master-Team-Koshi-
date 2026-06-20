import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseApp, getDb, isFirebaseConfigured, COLLECTIONS } from '../firebase/config';
import {
  wardAdminAccounts,
  WARD_LOGIN_ALIAS_MAP,
  findWardAdminAccountByEmail,
  isDemoAccountEmail,
} from '../data/wardAdminAccounts';
import {
  ROLES,
  canAccessAdmin,
  canEditProject,
  canManageWard,
  canReviewComplaint,
  filterProjectsForAdmin,
  filterComplaintsForAdmin,
  filterActivityForAdmin,
  getUserHomeRoute,
  getAdminAccessBlockReason,
  isApprovedWardAdmin as isApprovedWardAdminPerm,
  isWardAdminProfile,
  normalizeProfileRole,
} from '../utils/permissions';

export { ROLES };

/** Hackathon demo — in production, ward admins require municipality approval before access. */
export const MUNICIPALITY_NAME = 'Itahari Sub-Metropolitan City';

export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@itahari.demo',
    password: 'demo123',
    profile: {
      fullName: 'Demo Citizen',
      username: 'democitizen',
      role: ROLES.PUBLIC,
      wardNo: null,
      phone: '9800000001',
      approved: true,
      municipality: MUNICIPALITY_NAME,
    },
  },
};

const LOCAL_USERS_KEY = 'wardwatch_local_users';
const LOCAL_SESSION_KEY = 'wardwatch_local_session';

const USERNAME_PATTERN = /^[a-z0-9_]{3,}$/;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username) {
  return username?.trim().toLowerCase() ?? '';
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

  if (data.username) {
    profile.username = normalizeUsername(data.username);
  }

  if (data.loginAlias) {
    profile.loginAlias = data.loginAlias.trim().toLowerCase();
  }

  if (role === ROLES.WARD_ADMIN) {
    profile.positionTitle = data.positionTitle?.trim() || null;
    profile.status = data.status || (profile.approved ? 'approved' : 'pending');
  }

  return profile;
}

function normalizeStoredProfile(uid, data) {
  if (!data) return null;
  const profile = buildProfile(uid, data);
  profile.role = normalizeProfileRole(profile);
  return profile;
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

function upsertLocalDemoUser(next, { email, password, profileFields }) {
  const normalized = normalizeEmail(email);
  const idx = next.findIndex((u) => normalizeEmail(u.email) === normalized);
  const uid = idx >= 0 ? next[idx].uid : generateUid();
  const user = {
    uid,
    email: normalized,
    password,
    ...buildProfile(uid, { email: normalized, ...profileFields }),
  };

  if (idx >= 0) {
    next[idx] = user;
  } else {
    next.push(user);
  }

  return true;
}

function seedLocalDemoUsers() {
  const users = readLocalUsers();
  const next = [...users];
  let changed = false;

  Object.values(DEMO_ACCOUNTS).forEach(({ email, password, profile }) => {
    if (upsertLocalDemoUser(next, { email, password, profileFields: profile })) {
      changed = true;
    }
  });

  wardAdminAccounts.forEach((account) => {
    if (upsertLocalDemoUser(next, {
      email: account.firebaseEmail,
      password: account.password,
      profileFields: {
        fullName: account.fullName,
        email: account.firebaseEmail,
        loginAlias: account.loginAlias,
        role: ROLES.WARD_ADMIN,
        wardNo: account.wardNo,
        phone: account.phone,
        positionTitle: account.positionTitle,
        municipality: MUNICIPALITY_NAME,
        approved: account.approved,
        status: account.status,
      },
    })) {
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

function findLocalUserByUsername(username) {
  const users = seedLocalDemoUsers();
  const normalized = normalizeUsername(username);
  return users.find((u) => u.username === normalized) ?? null;
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

async function findEmailByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (!db) return null;

    const q = query(
      collection(db, COLLECTIONS.users),
      where('username', '==', normalized),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return normalizeEmail(snap.docs[0].data().email || '');
  }

  const user = findLocalUserByUsername(normalized);
  return user ? normalizeEmail(user.email) : null;
}

/**
 * Resolve a login identifier (email, username, or ward alias) to a Firebase email.
 */
export async function resolveLoginIdentifier(identifier) {
  const trimmed = identifier?.trim();
  if (!trimmed) {
    const err = new Error('Login ID is required.');
    err.code = 'auth/invalid-identifier';
    throw err;
  }

  const lower = trimmed.toLowerCase();

  if (WARD_LOGIN_ALIAS_MAP[lower]) {
    return WARD_LOGIN_ALIAS_MAP[lower];
  }

  if (lower.includes('@')) {
    return normalizeEmail(lower);
  }

  const email = await findEmailByUsername(lower);
  if (!email) {
    const err = new Error('Username not found.');
    err.code = 'auth/username-not-found';
    throw err;
  }

  return email;
}

export async function isUsernameTaken(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (!db) return false;

    const q = query(
      collection(db, COLLECTIONS.users),
      where('username', '==', normalized),
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }

  return Boolean(findLocalUserByUsername(normalized));
}

async function localRegister(payload) {
  seedLocalDemoUsers();

  if (findLocalUserByEmail(payload.email)) {
    const err = new Error('An account with this email already exists.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const isWardAdmin = payload.role === ROLES.WARD_ADMIN;

  if (!isWardAdmin && payload.username && findLocalUserByUsername(payload.username)) {
    const err = new Error('Username already taken. Please choose another username.');
    err.code = 'auth/username-already-in-use';
    throw err;
  }

  const uid = generateUid();
  const loginAlias = isWardAdmin && payload.wardNo ? `ward${payload.wardNo}@itahari` : null;

  const profile = buildProfile(uid, {
    fullName: payload.fullName,
    email: payload.email,
    username: isWardAdmin ? null : payload.username,
    loginAlias,
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
    const err = new Error('Invalid login ID or password.');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  const wardTemplate = findWardAdminAccountByEmail(email);
  const profile = stripPassword(user);

  if (wardTemplate && profile?.role !== ROLES.WARD_ADMIN) {
    const err = new Error('Ward admin profile not found.');
    err.code = 'auth/ward-admin-not-found';
    throw err;
  }

  if (profile?.role === ROLES.WARD_ADMIN && !profile.wardNo) {
    const err = new Error('Your admin profile is incomplete.');
    err.code = 'auth/incomplete-admin-profile';
    throw err;
  }

  writeLocalSession(user.uid);
  return profile;
}

async function localLogout() {
  writeLocalSession(null);
}

/** Clear all locally cached auth users and session (dev reset). */
export function clearLocalAuthStorage() {
  writeLocalSession(null);
  localStorage.removeItem(LOCAL_USERS_KEY);
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
  const loginAlias = isWardAdmin && payload.wardNo ? `ward${payload.wardNo}@itahari` : null;

  const profile = buildProfile(cred.user.uid, {
    fullName: payload.fullName,
    email: payload.email,
    username: isWardAdmin ? null : payload.username,
    loginAlias,
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

  const normalizedEmail = normalizeEmail(email);
  const wardTemplate = findWardAdminAccountByEmail(normalizedEmail);

  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  } catch {
    const canAutoProvision = wardTemplate && password === wardTemplate.password;

    if (canAutoProvision) {
      try {
        cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await firebaseUpdateProfile(cred.user, { displayName: wardTemplate.fullName });
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          const err = new Error('Invalid login ID or password.');
          err.code = 'auth/invalid-credential';
          throw err;
        }
        throw createErr;
      }
    } else {
      const err = new Error('Invalid login ID or password.');
      err.code = 'auth/invalid-credential';
      throw err;
    }
  }

  let profile = await firebaseFetchProfile(cred.user.uid);

  if (!profile) {
    if (wardTemplate) {
      profile = buildProfile(cred.user.uid, {
        fullName: wardTemplate.fullName,
        email: wardTemplate.firebaseEmail,
        loginAlias: wardTemplate.loginAlias,
        role: ROLES.WARD_ADMIN,
        wardNo: wardTemplate.wardNo,
        phone: wardTemplate.phone,
        positionTitle: wardTemplate.positionTitle,
        municipality: MUNICIPALITY_NAME,
        approved: true,
        status: 'approved',
        photoURL: cred.user.photoURL,
      });
      await firebaseSaveProfile(cred.user.uid, profile);
    } else {
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
  }

  if (wardTemplate && profile.role !== ROLES.WARD_ADMIN) {
    const err = new Error('Ward admin profile not found.');
    err.code = 'auth/ward-admin-not-found';
    throw err;
  }

  if (profile.role === ROLES.WARD_ADMIN && !profile.wardNo) {
    const err = new Error('Your admin profile is incomplete.');
    err.code = 'auth/incomplete-admin-profile';
    throw err;
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
      const localProfile = await localGetCurrentProfile();
      if (localProfile && isDemoAccountEmail(localProfile.email)) {
        callback(localProfile);
        return;
      }
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
  fullName, username, email, password, confirmPassword, role, wardNo, phone,
}) {
  const errors = {};

  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email';

  if (role === ROLES.PUBLIC) {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      errors.username = 'Username is required';
    } else if (!USERNAME_PATTERN.test(normalizedUsername)) {
      errors.username = 'Username must be 3+ characters: lowercase letters, numbers, and underscore only';
    }
  }

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

  if (!isWardAdmin && payload.username) {
    const taken = await isUsernameTaken(payload.username);
    if (taken) {
      const err = new Error('Username already taken. Please choose another username.');
      err.code = 'auth/username-already-in-use';
      throw err;
    }
  }

  const safePayload = {
    fullName: payload.fullName,
    username: isWardAdmin ? null : normalizeUsername(payload.username),
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    // Citizens always register as public; ward_admin only when explicitly registering as IT/Admin.
    role: isWardAdmin ? ROLES.WARD_ADMIN : ROLES.PUBLIC,
    wardNo: isWardAdmin ? payload.wardNo : payload.wardNo || null,
    positionTitle: isWardAdmin ? payload.positionTitle : null,
  };

  if (isFirebaseConfigured()) {
    return firebaseRegister(safePayload);
  }
  return localRegister(safePayload);
}

export async function loginUser(identifier, password) {
  const email = await resolveLoginIdentifier(identifier);

  if (isFirebaseConfigured()) {
    try {
      return await firebaseLogin(email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' && isDemoAccountEmail(email)) {
        return localLogin(email, password);
      }
      throw err;
    }
  }
  return localLogin(email, password);
}

export async function logoutUser() {
  await localLogout();
  if (isFirebaseConfigured()) {
    return firebaseLogout();
  }
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
  return isWardAdminProfile(profile);
}

export function isApprovedWardAdmin(profile) {
  return isApprovedWardAdminPerm(profile);
}

export function canAccessAdminPortal(profile) {
  return canAccessAdmin(profile);
}

export function validatePostLogin(profile) {
  const blockReason = getAdminAccessBlockReason(profile);
  if (blockReason && isWardAdminProfile(profile) && !canAccessAdmin(profile)) {
    return { ok: true, path: '/dashboard', adminBlocked: blockReason };
  }
  return { ok: true, path: getUserHomeRoute(profile) };
}

export function getPostLoginPath(profile) {
  return getUserHomeRoute(profile);
}

export function getRegistrationSuccessMessage(profile) {
  if (isWardAdminProfile(profile)) {
    return `Ward IT/Admin account created successfully. You are now managing Ward ${profile.wardNo} records.`;
  }
  return 'Citizen account created successfully.';
}

export function assertWardProjectAccess(profile, project) {
  return canEditProject(profile, project);
}

export {
  canAccessAdmin,
  canManageWard,
  canEditProject,
  canReviewComplaint,
  getUserHomeRoute,
  getAdminAccessBlockReason,
  filterProjectsForAdmin,
  filterComplaintsForAdmin,
  filterActivityForAdmin,
};
