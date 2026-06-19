/**
 * QR / public URL helpers.
 * Phones cannot open localhost — set VITE_PUBLIC_URL to your LAN IP or deploy URL.
 * Example: VITE_PUBLIC_URL=http://192.168.1.42:5174
 */

export function getPublicBaseUrl() {
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    // When opened via LAN IP on any device, QR uses the same host + port (always in sync)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin;
    }
  }

  const envUrl = import.meta.env.VITE_PUBLIC_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (typeof window !== 'undefined') return window.location.origin;
  return '';
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
