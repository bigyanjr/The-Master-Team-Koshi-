/**
 * Dev-only "live sync" client — talks to the tiny endpoint added in
 * vite.config.js (`liveSyncPlugin`). See the comment there for why this
 * exists: with no Firebase configured, there is no shared backend, so a QR
 * scanned on a phone is otherwise frozen at whatever snapshot it carried —
 * admin edits made afterward never reach an already-open scan page. This
 * lets any device that loaded the app over the same LAN URL push/pull the
 * current app data from the dev server itself.
 *
 * Both calls are best-effort: if the endpoint doesn't exist (e.g. a
 * production build with no dev server behind it), they silently no-op so
 * nothing else in the app breaks.
 */

const SYNC_ENDPOINT = '/__wardwatch_sync';

export async function pushLiveSync(data) {
  try {
    await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // best-effort only
  }
}

export async function fetchLiveSync() {
  try {
    const res = await fetch(SYNC_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json && Array.isArray(json.projects) ? json : null;
  } catch {
    return null;
  }
}
