/**
 * Frontend role and permission checks for WardWatch Itahari.
 * Admin access is granted only from an approved ward_admin profile in the users collection.
 */

export const ROLES = {
  PUBLIC: 'public',
  WARD_ADMIN: 'ward_admin',
};

/** Missing or unknown profiles are treated as public citizens. */
export function normalizeProfileRole(profile) {
  if (!profile?.role || profile.role !== ROLES.WARD_ADMIN) {
    return ROLES.PUBLIC;
  }
  return ROLES.WARD_ADMIN;
}

export function isWardAdminProfile(profile) {
  return normalizeProfileRole(profile) === ROLES.WARD_ADMIN;
}

export function isApprovedWardAdmin(profile) {
  return isWardAdminProfile(profile)
    && profile.approved === true
    && profile.wardNo != null;
}

/** Approved ward IT/Admin with an assigned ward. */
export function canAccessAdmin(userProfile) {
  return isApprovedWardAdmin(userProfile);
}

/** Ward admin may only manage their own ward number. */
export function canManageWard(userProfile, wardNo) {
  if (!canAccessAdmin(userProfile)) return false;
  const assigned = Number(userProfile.wardNo);
  const target = Number(wardNo);
  return Number.isFinite(assigned) && Number.isFinite(target) && assigned === target;
}

export function canEditProject(userProfile, project) {
  if (!project) return false;
  return canManageWard(userProfile, project.wardNo);
}

export function canReviewComplaint(userProfile, complaint) {
  if (!complaint) return false;
  return canManageWard(userProfile, complaint.wardNo);
}

export function getUserHomeRoute(userProfile) {
  if (canAccessAdmin(userProfile)) return '/admin';
  return '/dashboard';
}

/** Human-readable reason when admin portal access is denied. */
export function getAdminAccessBlockReason(userProfile) {
  if (!userProfile) {
    return 'Sign in with a ward admin account to access this area.';
  }

  if (!isWardAdminProfile(userProfile)) {
    return 'You are not authorised to access ward admin records.';
  }

  if (userProfile.wardNo == null) {
    return 'Your admin profile is incomplete. Ward assignment is required before admin access.';
  }

  if (userProfile.approved !== true) {
    return 'Your ward admin account is not yet approved. Municipality approval is required before you can manage ward records.';
  }

  return null;
}

export function filterProjectsForAdmin(projects, userProfile) {
  if (!canAccessAdmin(userProfile)) return [];
  return projects.filter((p) => canManageWard(userProfile, p.wardNo));
}

export function filterComplaintsForAdmin(projects, userProfile) {
  const wardProjects = filterProjectsForAdmin(projects, userProfile);
  const wardProjectIds = new Set(wardProjects.map((p) => p.id));
  return projects.flatMap((p) =>
    (p.complaints ?? [])
      .filter(() => wardProjectIds.has(p.id))
      .map((c) => ({
        ...c,
        projectId: p.id,
        projectTitle: p.title,
        wardNo: p.wardNo,
      })),
  );
}

export function filterActivityForAdmin(activity, projects, userProfile) {
  const wardProjectIds = new Set(filterProjectsForAdmin(projects, userProfile).map((p) => p.id));
  return activity.filter((a) => !a.projectId || wardProjectIds.has(a.projectId));
}
