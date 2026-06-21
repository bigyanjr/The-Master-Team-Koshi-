/**
 * QR / public URL helpers.
 * Phones cannot open localhost — set VITE_PUBLIC_URL to your LAN IP or deploy URL.
 * Example: VITE_PUBLIC_URL=http://192.168.1.42:5174
 */

import {
  getTotalPaid,
  getRiskLevel,
  calculateTrustScore,
  generateRiskExplanation,
} from './riskEngine';

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** Merge env LAN host with the port Vite is actually running on. */
function buildLanUrlFromEnv(envUrl, devPort) {
  try {
    const parsed = new URL(envUrl);
    const port = devPort || parsed.port;
    const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : '';
    return `${parsed.protocol}//${parsed.hostname}${portSuffix}`;
  } catch {
    return envUrl.replace(/\/$/, '');
  }
}

export function getPublicBaseUrl() {
  if (typeof window !== 'undefined') {
    const { hostname, origin, port } = window.location;

    // Opened via LAN IP — QR always matches the live dev server port.
    if (!isLocalHost(hostname)) {
      return origin;
    }

    const envUrl = import.meta.env.VITE_PUBLIC_URL?.trim();
    if (envUrl) {
      return buildLanUrlFromEnv(envUrl, port);
    }

    return origin;
  }

  const envUrl = import.meta.env.VITE_PUBLIC_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');

  return '';
}

export function getSuggestedLanUrl() {
  if (typeof window === 'undefined') return null;

  const envUrl = import.meta.env.VITE_PUBLIC_URL?.trim();
  const { hostname, port, protocol } = window.location;

  if (!isLocalHost(hostname)) {
    return window.location.origin;
  }

  if (envUrl) {
    return buildLanUrlFromEnv(envUrl, port);
  }

  // No env — show pattern using current port (user must substitute IP from `ipconfig`).
  const portSuffix = port ? `:${port}` : '';
  return `${protocol}//YOUR_WIFI_IP${portSuffix}`;
}

export function getQrDemoUrl(projectId) {
  return `${getPublicBaseUrl()}/qr-demo/${projectId}`;
}

/**
 * ROOT CAUSE (cross-device QR bug): with no Firebase configured, project
 * data only lives in the admin's own browser localStorage (see
 * services/localStore.js). A phone scanning the QR is a completely
 * different browser/device with its own empty storage for this site, so
 * looking the project up by id there always returns "Project not found" —
 * not because anything is broken, but because there is nowhere for the two
 * devices to share data without a real backend.
 *
 * Fix: bake a compact, precomputed snapshot of the project's public-facing
 * numbers into the QR link itself (as a base64url `d=` query param), built
 * on the admin's machine where the live data actually exists. The phone can
 * then render the scan page entirely from the link, no shared storage
 * needed. ProjectMobileScan.jsx still prefers live DataContext data first —
 * once this app is connected to a real Firebase project, scans will use
 * live synced data automatically and the embedded snapshot becomes an
 * unused fallback.
 */
/**
 * A long encoded payload makes the QR module grid extremely dense — dense
 * enough that a phone camera scanning it off a lit screen can easily misread
 * a character, which corrupts the data and makes decode fail silently
 * (caught below), landing back on "Project not found" even though the QR
 * "worked" in the sense that a URL did get encoded. Two earlier attempts at
 * this (a full JSON snapshot, then a short-keyed JSON snapshot) were still
 * too dense to scan reliably, so this version drops JSON entirely: it's a
 * fixed-position list of bare values joined by a control character that
 * never appears in real project text, with every non-essential field cut.
 * That removes all the quote/colon/brace/key-name overhead JSON carries and
 * keeps only what the scan page actually needs to render something useful.
 */
const SCAN_FIELD_ORDER = [
  'id', 'wardNo', 'title', 'location', 'status', 'progressPercent',
  'allocatedBudget', 'paidAmount', 'contractorName',
  'paymentCount', 'proofCount', 'complaintCount',
  'riskLabel', 'riskScore', 'riskExplanation', 'snapshotDate',
];
const SCAN_FIELD_DELIMITER = String.fromCharCode(31);

export function buildScanSnapshot(project, allProjects = project ? [project] : []) {
  if (!project) return null;

  const payments = project.payments ?? [];
  const proofs = project.proofs ?? [];

  return {
    id: project.id,
    wardNo: project.wardNo,
    title: project.title,
    location: project.location,
    status: project.status,
    progressPercent: project.progressPercent,
    allocatedBudget: project.allocatedBudget,
    paidAmount: getTotalPaid(project),
    contractorName: project.contractorName,
    paymentCount: payments.length,
    proofCount: proofs.length,
    complaintCount: (project.complaints ?? []).length,
    riskLabel: getRiskLevel(project, allProjects).label,
    riskScore: calculateTrustScore(project, allProjects),
    // Short, not the full sentence — free text is the most expensive thing
    // to carry in a QR, byte for byte.
    riskExplanation: generateRiskExplanation(project, allProjects).slice(0, 60),
    snapshotDate: new Date().toISOString().split('T')[0],
  };
}

function base64UrlEncode(str) {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const withPadding = padded + '='.repeat((4 - (padded.length % 4)) % 4);
  return decodeURIComponent(escape(atob(withPadding)));
}

export function encodeScanSnapshot(project, allProjects) {
  try {
    const snapshot = buildScanSnapshot(project, allProjects);
    if (!snapshot) return null;
    const ordered = SCAN_FIELD_ORDER.map((key) => (snapshot[key] ?? '').toString());
    return base64UrlEncode(ordered.join(SCAN_FIELD_DELIMITER));
  } catch {
    return null;
  }
}

/** Expand the compact wire format back into the names the rest of the app uses. */
export function decodeScanSnapshot(encoded) {
  if (!encoded) return null;
  try {
    const parts = base64UrlDecode(encoded).split(SCAN_FIELD_DELIMITER);
    if (parts.length !== SCAN_FIELD_ORDER.length) return null;
    const raw = {};
    SCAN_FIELD_ORDER.forEach((key, i) => { raw[key] = parts[i]; });
    if (!raw.id) return null;

    const allocatedBudget = Number(raw.allocatedBudget) || 0;
    const paidAmount = Number(raw.paidAmount) || 0;

    return {
      id: raw.id,
      wardNo: Number(raw.wardNo),
      title: raw.title,
      location: raw.location,
      status: raw.status,
      progressPercent: Number(raw.progressPercent) || 0,
      allocatedBudget,
      paidAmount,
      budgetUsedPercent: allocatedBudget > 0 ? Math.round((paidAmount / allocatedBudget) * 100) : 0,
      contractorName: raw.contractorName || null,
      paymentCount: Number(raw.paymentCount) || 0,
      proofCount: Number(raw.proofCount) || 0,
      complaintCount: Number(raw.complaintCount) || 0,
      riskLabel: raw.riskLabel || null,
      riskScore: raw.riskScore === '' ? null : Number(raw.riskScore),
      riskExplanation: raw.riskExplanation || '',
      riskFlagLabels: [],
      latestPayment: null,
      latestProofTitle: null,
      snapshotAt: raw.snapshotDate,
    };
  } catch {
    return null;
  }
}

/**
 * Mobile citizen scan view — lightweight project facts for QR codes.
 * Pass the live `project` (and optionally the full `allProjects` list for
 * accurate risk comparison) so the link works even on a device that has
 * never loaded this app before. See the root-cause note above.
 */
export function getProjectScanUrl(projectId, project = null, allProjects) {
  const base = `${getPublicBaseUrl()}/scan/${projectId}`;
  if (!project) return base;
  const encoded = encodeScanSnapshot(project, allProjects);
  return encoded ? `${base}?d=${encoded}` : base;
}

/** Full desktop project page (for sharing from admin). */
export function getProjectPublicUrl(projectId) {
  return `${getPublicBaseUrl()}/projects/${projectId}`;
}

export function isLocalhostUrl(url = getPublicBaseUrl()) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

/** True when QR may not work on a phone (localhost or env port drift). */
export function getQrMobileSetupIssue() {
  if (typeof window === 'undefined') return null;

  const scanBase = getPublicBaseUrl();
  const { hostname, port, origin } = window.location;

  if (isLocalhostUrl(scanBase)) {
    return {
      type: 'localhost',
      message: 'QR points to localhost — phones cannot open that. Set VITE_PUBLIC_URL to your Wi‑Fi IP.',
      suggestedUrl: getSuggestedLanUrl(),
    };
  }

  if (!isLocalHost(hostname) && port && scanBase !== origin) {
    return {
      type: 'port_mismatch',
      message: 'QR port does not match this page. Refresh after starting the dev server.',
      suggestedUrl: origin,
    };
  }

  return null;
}
