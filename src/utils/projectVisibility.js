import { canManageWard, isApprovedWardAdmin } from './permissions';

/** Project is visible on public citizen pages. */
export function isPublicProject(project) {
  if (!project) return false;
  return project.publicVisible === true || project.published === true;
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
