/**
 * QR / public URL helpers.
 * Phones cannot open localhost — set VITE_PUBLIC_URL to your LAN IP or deploy URL.
 * Example: VITE_PUBLIC_URL=http://192.168.1.42:5174
 */

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

/** Mobile citizen scan view — lightweight project facts for QR codes. */
export function getProjectScanUrl(projectId) {
  return `${getPublicBaseUrl()}/scan/${projectId}`;
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
