/**
 * Official hackathon demo ward IT/Admin accounts.
 * Short login aliases (ward1@itahari) map to Firebase emails (ward1@itahari.demo).
 */
export const wardAdminAccounts = [
  {
    wardNo: 1,
    loginAlias: 'ward1@itahari',
    firebaseEmail: 'ward1@itahari.demo',
    password: 'demo123',
    fullName: 'Ward 1 IT Admin',
    phone: '9800000101',
    role: 'ward_admin',
    approved: true,
    status: 'approved',
    positionTitle: 'Ward IT Officer',
  },
  {
    wardNo: 2,
    loginAlias: 'ward2@itahari',
    firebaseEmail: 'ward2@itahari.demo',
    password: 'demo123',
    fullName: 'Ward 2 IT Admin',
    phone: '9800000102',
    role: 'ward_admin',
    approved: true,
    status: 'approved',
    positionTitle: 'Ward IT Officer',
  },
  {
    wardNo: 3,
    loginAlias: 'ward3@itahari',
    firebaseEmail: 'ward3@itahari.demo',
    password: 'demo123',
    fullName: 'Ward 3 IT Admin',
    phone: '9800000103',
    role: 'ward_admin',
    approved: true,
    status: 'approved',
    positionTitle: 'Ward IT Officer',
  },
  {
    wardNo: 4,
    loginAlias: 'ward4@itahari',
    firebaseEmail: 'ward4@itahari.demo',
    password: 'demo123',
    fullName: 'Ward 4 IT Admin',
    phone: '9800000104',
    role: 'ward_admin',
    approved: true,
    status: 'approved',
    positionTitle: 'Ward IT Officer',
  },
  {
    wardNo: 5,
    loginAlias: 'ward5@itahari',
    firebaseEmail: 'ward5@itahari.demo',
    password: 'demo123',
    fullName: 'Ward 5 IT Admin',
    phone: '9800000105',
    role: 'ward_admin',
    approved: true,
    status: 'approved',
    positionTitle: 'Ward IT Officer',
  },
];

export const WARD_LOGIN_ALIAS_MAP = Object.fromEntries(
  wardAdminAccounts.map((a) => [a.loginAlias.toLowerCase(), a.firebaseEmail.toLowerCase()]),
);

export function findWardAdminAccountByEmail(email) {
  const normalized = email?.trim().toLowerCase();
  return wardAdminAccounts.find((a) => a.firebaseEmail.toLowerCase() === normalized) ?? null;
}

export function findWardAdminAccountByAlias(alias) {
  const normalized = alias?.trim().toLowerCase();
  return wardAdminAccounts.find((a) => a.loginAlias.toLowerCase() === normalized) ?? null;
}

export function isDemoAccountEmail(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return wardAdminAccounts.some((a) => a.firebaseEmail.toLowerCase() === normalized)
    || normalized === 'citizen@itahari.demo';
}
