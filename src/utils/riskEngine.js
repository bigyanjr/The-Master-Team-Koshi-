/**
 * Risk & trust scoring for WardWatch projects.
 * Each project carries nested payments, proofs, and complaints.
 */

const FLAG_DEFS = {
  PAYMENT_WITHOUT_PROOF: {
    id: 'PAYMENT_WITHOUT_PROOF',
    label: 'Payment without proof',
    severity: 'high',
    description: 'Payments have been released but no supporting proof has been uploaded.',
    penalty: 20,
  },
  DELAYED_PROJECT: {
    id: 'DELAYED_PROJECT',
    label: 'Delayed project',
    severity: 'high',
    description: 'The project deadline has passed but work is not yet complete.',
    penalty: 20,
  },
  HIGH_CITIZEN_CONCERN: {
    id: 'HIGH_CITIZEN_CONCERN',
    label: 'High citizen concern',
    severity: 'high',
    description: 'More than five citizen complaints have been filed against this project.',
    penalty: 15,
  },
  BUDGET_PROGRESS_MISMATCH: {
    id: 'BUDGET_PROGRESS_MISMATCH',
    label: 'Budget-progress mismatch',
    severity: 'high',
    description: 'Over 70% of the budget is spent while physical progress remains below 50%.',
    penalty: 20,
  },
  TENDER_EXCEEDS_ALLOCATION: {
    id: 'TENDER_EXCEEDS_ALLOCATION',
    label: 'Tender exceeds allocation',
    severity: 'medium',
    description: 'The awarded tender amount exceeds the ward allocated budget.',
    penalty: 15,
  },
  COMPLETION_PROOF_MISSING: {
    id: 'COMPLETION_PROOF_MISSING',
    label: 'Completion proof missing',
    severity: 'medium',
    description: 'Project is marked completed but lacks after photos or completion documents.',
    penalty: 10,
  },
};

function payments(project) {
  return project.payments ?? [];
}

function proofs(project) {
  return project.proofs ?? [];
}

function complaints(project) {
  return project.complaints ?? [];
}

export function getTotalPaid(project) {
  return payments(project).reduce((sum, p) => sum + (p.amount ?? 0), 0);
}

export function getBudgetUsedPercent(project) {
  const allocated = project.allocatedBudget ?? 0;
  if (allocated <= 0) return 0;
  return Math.round((getTotalPaid(project) / allocated) * 100);
}

export function getProgressPercent(project) {
  return project.progressPercent ?? 0;
}

function isDeadlinePassed(project) {
  if (!project.deadline) return false;
  const deadline = new Date(project.deadline);
  deadline.setHours(23, 59, 59, 999);
  return deadline < new Date();
}

function hasCompletionProof(project) {
  return proofs(project).some(
    (p) => p.type === 'after' || p.type === 'document'
  );
}

export function getRiskFlags(project) {
  const flags = [];
  const paid = getTotalPaid(project);
  const progress = getProgressPercent(project);
  const budgetUsed = getBudgetUsedPercent(project);
  const complaintCount = complaints(project).length;
  const projectProofs = proofs(project);
  const status = project.status ?? '';

  if (paid > 0 && projectProofs.length === 0) {
    flags.push(FLAG_DEFS.PAYMENT_WITHOUT_PROOF);
  }

  if (isDeadlinePassed(project) && progress < 100) {
    flags.push(FLAG_DEFS.DELAYED_PROJECT);
  }

  if (complaintCount > 5) {
    flags.push(FLAG_DEFS.HIGH_CITIZEN_CONCERN);
  }

  if (progress < 50 && budgetUsed > 70) {
    flags.push(FLAG_DEFS.BUDGET_PROGRESS_MISMATCH);
  }

  if ((project.tenderAmount ?? 0) > (project.allocatedBudget ?? 0)) {
    flags.push(FLAG_DEFS.TENDER_EXCEEDS_ALLOCATION);
  }

  if (status === 'Completed' && !hasCompletionProof(project)) {
    flags.push(FLAG_DEFS.COMPLETION_PROOF_MISSING);
  }

  return flags;
}

export function calculateTrustScore(project) {
  let score = 100;
  const flags = getRiskFlags(project);

  flags.forEach((flag) => {
    score -= flag.penalty ?? 0;
  });

  return Math.max(0, Math.min(100, score));
}

export function getRiskLevel(project) {
  const score = calculateTrustScore(project);

  if (score >= 80) {
    return { label: 'Low Risk', color: 'emerald', score };
  }
  if (score >= 50) {
    return { label: 'Medium Risk', color: 'amber', score };
  }
  return { label: 'High Risk', color: 'red', score };
}

export function getTrustLabel(score) {
  if (score >= 80) return { label: 'Low Risk', color: 'emerald' };
  if (score >= 50) return { label: 'Medium Risk', color: 'amber' };
  return { label: 'High Risk', color: 'red' };
}

export function getProjectHealth(project) {
  const trustScore = calculateTrustScore(project);
  const riskLevel = getRiskLevel(project);
  const flags = getRiskFlags(project);
  const budgetUsedPercent = getBudgetUsedPercent(project);
  const progressPercent = getProgressPercent(project);
  const totalPaid = getTotalPaid(project);

  let summary = 'Project is on track with no major risk flags.';
  if (flags.length === 1) {
    summary = `One risk flag active: ${flags[0].label}.`;
  } else if (flags.length > 1) {
    summary = `${flags.length} risk flags active — review recommended.`;
  }

  return {
    trustScore,
    riskLevel,
    flags,
    budgetUsedPercent,
    progressPercent,
    totalPaid,
    complaintCount: complaints(project).length,
    proofCount: proofs(project).length,
    summary,
  };
}

export function aggregateWardStats(wardNo, projects) {
  const wardProjects = projects.filter((p) => p.wardNo === wardNo);

  return {
    projectCount: wardProjects.length,
    totalBudget: wardProjects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0),
    totalSpent: wardProjects.reduce((s, p) => s + getTotalPaid(p), 0),
    delayedCount: wardProjects.filter((p) => p.status === 'Delayed').length,
    avgProgress: wardProjects.length
      ? Math.round(wardProjects.reduce((s, p) => s + getProgressPercent(p), 0) / wardProjects.length)
      : 0,
    avgTrust: wardProjects.length
      ? Math.round(wardProjects.reduce((s, p) => s + calculateTrustScore(p), 0) / wardProjects.length)
      : 0,
  };
}

export function getAllPayments(projects) {
  return projects.flatMap((p) =>
    (p.payments ?? []).map((payment) => ({ ...payment, projectId: p.id }))
  );
}

export function getAllComplaints(projects) {
  return projects.flatMap((p) =>
    (p.complaints ?? []).map((c) => ({
      ...c,
      projectId: p.id,
      wardNo: p.wardNo,
    }))
  );
}

export function getLastUpdatedDate(project) {
  const dates = [
    ...(project.payments ?? []).map((p) => p.date),
    ...(project.proofs ?? []).map((p) => p.uploadedAt),
  ].filter(Boolean);

  if (!dates.length) return project.startDate || null;
  return dates.reduce((latest, d) => (new Date(d) > new Date(latest) ? d : latest));
}

export function getDelayScore(project) {
  if (project.status === 'Delayed') {
    const days = project.deadline
      ? Math.max(0, (Date.now() - new Date(project.deadline).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    return 10000 + days;
  }
  if (project.deadline && getProgressPercent(project) < 100) {
    const deadline = new Date(project.deadline);
    if (deadline < new Date()) {
      return (Date.now() - deadline.getTime()) / (1000 * 60 * 60 * 24);
    }
  }
  return 0;
}

export function getRecentActivity(projects, limit = 5) {
  const events = [];

  projects.forEach((project) => {
    (project.payments ?? []).forEach((payment) => {
      events.push({
        id: `pay-${project.id}-${payment.date}-${payment.amount}`,
        type: 'payment',
        date: payment.date,
        title: payment.milestone,
        subtitle: project.title,
        detail: `${payment.amount}`,
        projectId: project.id,
      });
    });
    (project.proofs ?? []).forEach((proof, i) => {
      events.push({
        id: `proof-${project.id}-${i}`,
        type: 'proof',
        date: proof.uploadedAt,
        title: proof.title,
        subtitle: project.title,
        detail: proof.type,
        projectId: project.id,
      });
    });
  });

  return events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
