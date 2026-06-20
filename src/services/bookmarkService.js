/**
 * Local bookmark storage for citizen project tracking (demo / offline mode).
 */

const STORAGE_KEY = 'wardwatch_bookmarks';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBookmarkedProjectIds(uid) {
  if (!uid) return [];
  return readAll()[uid] ?? [];
}

export function isProjectBookmarked(uid, projectId) {
  return getBookmarkedProjectIds(uid).includes(projectId);
}

export function toggleProjectBookmark(uid, projectId) {
  if (!uid || !projectId) return getBookmarkedProjectIds(uid);

  const all = readAll();
  const current = new Set(all[uid] ?? []);

  if (current.has(projectId)) {
    current.delete(projectId);
  } else {
    current.add(projectId);
  }

  all[uid] = [...current];
  writeAll(all);
  return all[uid];
}

export function getBookmarkedProjects(uid, projects = []) {
  const ids = new Set(getBookmarkedProjectIds(uid));
  return projects.filter((p) => ids.has(p.id));
}
