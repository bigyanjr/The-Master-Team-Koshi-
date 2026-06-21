import { canManageWard, isApprovedWardAdmin } from './permissions';

/**
 * Project is visible on public citizen pages.
 *
 * ROOT CAUSE (data-flow bug): this used to require `publicVisible === true ||
 * published === true`. Any record missing those exact fields — e.g. a row
 * inserted directly into Firestore/localStorage by hand for testing, or a
 * future API response that doesn't echo them back — fell through with
 * `undefined`, which is neither `true` nor `false`, so the strict `=== true`
 * check silently hid it from every citizen page even though nothing was
 * actually marked private. Default is now "public unless explicitly hidden":
 * only an explicit `false` on either flag hides a project.
 */
export function isPublicProject(project) {
  if (!project) return false;
  return project.publicVisible !== false && project.published !== false;
}

export function getPublicProjects(projects = []) {
  return projects.filter(isPublicProject);
}

/** Citizens see published projects; ward admins can view their own ward records. */
export function canViewProject(project, userProfile) {
  if (!project) return false;
  if (isPublicProject(project)) return true;
  if (isApprovedWardAdmin(userProfile) && canManageWard(userProfile, project.wardNo)) {
    return true;
  }
  return false;
}

export function findViewableProject(projects, projectId, userProfile) {
  const project = projects.find((p) => p.id === projectId);
  if (!project || !canViewProject(project, userProfile)) return null;
  return project;
}

export function getPublicComplaints(projects = []) {
  return getPublicProjects(projects).flatMap((p) =>
    (p.complaints ?? []).map((c) => ({
      ...c,
      projectId: c.projectId || p.id,
      projectTitle: c.projectTitle || p.title,
      wardNo: c.wardNo ?? p.wardNo,
    })),
  );
}
