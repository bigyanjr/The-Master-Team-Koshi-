const RISK_DEFINITIONS = {
  PAYMENT_WITHOUT_PROGRESS: {
    id: 'PAYMENT_WITHOUT_PROGRESS',
    label: 'Payment Without Progress',
    severity: 'high',
    description: 'Significant payments made while physical progress remains low.',
  },
  MISSING_PROOF: {
    id: 'MISSING_PROOF',
    label: 'Missing Proof',
    severity: 'medium',
    description: 'Expected milestone proofs have not been uploaded.',
  },
  DELAYED_MILESTONE: {
    id: 'DELAYED_MILESTONE',
    label: 'Delayed Milestone',
    severity: 'high',
    description: 'Project is past its expected completion date.',
  },
  BUDGET_OVERRUN: {
    id: 'BUDGET_OVERRUN',
    label: 'Budget Overrun',
    severity: 'high',
    description: 'Spending exceeds the approved budget allocation.',
  },
  STALE_UPDATES: {
    id: 'STALE_UPDATES',
    label: 'Stale Updates',
    severity: 'medium',
    description: 'No progress update posted in the last 30 days.',
  },
  COMPLAINT_PENDING: {
    id: 'COMPLAINT_PENDING',
    label: 'Pending Complaints',
    severity: 'medium',
    description: 'Open citizen complaints linked to this project.',
  },
  UNVERIFIED_CONTRACTOR: {
    id: 'UNVERIFIED_CONTRACTOR',
    label: 'Unverified Contractor',
    severity: 'low',
    description: 'Assigned contractor lacks verified credentials.',
  },
};

export function getRiskDefinition(flagId) {
  return RISK_DEFINITIONS[flagId] || null;
}

export function getRiskFlags(project, { payments = [], proofs = [], updates = [], complaints = [], contractors = [] } = {}) {
  const flags = [];
  const now = new Date();

  const projectPayments = payments.filter((p) => p.projectId === project.id);
  const projectProofs = proofs.filter((p) => p.projectId === project.id);
  const projectUpdates = updates.filter((u) => u.projectId === project.id);
  const projectComplaints = complaints.filter((c) => c.projectId === project.id);

  const totalPaid = projectPayments.reduce((sum, p) => sum + p.amount, 0);
  const progress = project.progress ?? 0;

  if (totalPaid > 0 && progress < 20 && totalPaid > project.budget * 0.3) {
    flags.push(RISK_DEFINITIONS.PAYMENT_WITHOUT_PROGRESS);
  }

  if (progress >= 25 && projectProofs.length === 0) {
    flags.push(RISK_DEFINITIONS.MISSING_PROOF);
  }

  if (project.expectedEndDate && project.status !== 'completed') {
    const expected = new Date(project.expectedEndDate);
    if (expected < now && progress < 90) {
      flags.push(RISK_DEFINITIONS.DELAYED_MILESTONE);
    }
  }

  if (totalPaid > project.budget * 1.05) {
    flags.push(RISK_DEFINITIONS.BUDGET_OVERRUN);
  }

  if (projectUpdates.length > 0) {
    const latest = projectUpdates.reduce((a, b) =>
      new Date(a.date) > new Date(b.date) ? a : b
    );
    const daysSinceUpdate = (now - new Date(latest.date)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 30 && project.status === 'in-progress') {
      flags.push(RISK_DEFINITIONS.STALE_UPDATES);
    }
  } else if (project.status === 'in-progress') {
    flags.push(RISK_DEFINITIONS.STALE_UPDATES);
  }

  const openComplaints = projectComplaints.filter((c) => c.status === 'open' || c.status === 'investigating');
  if (openComplaints.length > 0) {
    flags.push(RISK_DEFINITIONS.COMPLAINT_PENDING);
  }

  const contractor = contractors.find((c) => c.id === project.contractorId);
  if (contractor && !contractor.verified) {
    flags.push(RISK_DEFINITIONS.UNVERIFIED_CONTRACTOR);
  }

  return flags;
}

export function calculateTrustScore(project, context = {}) {
  const { payments = [], proofs = [], updates = [], complaints = [], contractors = [] } = context;
  let score = 100;

  const flags = getRiskFlags(project, { payments, proofs, updates, complaints, contractors });

  const severityPenalty = { high: 18, medium: 10, low: 5 };
  flags.forEach((flag) => {
    score -= severityPenalty[flag.severity] || 8;
  });

  const projectPayments = payments.filter((p) => p.projectId === project.id);
  const projectProofs = proofs.filter((p) => p.projectId === project.id);
  const projectUpdates = updates.filter((u) => u.projectId === project.id);

  if (projectProofs.some((p) => p.verified)) score += 5;
  if (projectUpdates.length >= 3) score += 3;
  if (project.status === 'completed' && (project.progress ?? 0) >= 100) score += 5;

  const totalPaid = projectPayments.reduce((sum, p) => sum + p.amount, 0);
  const spendRatio = project.budget > 0 ? totalPaid / project.budget : 0;
  const progressRatio = (project.progress ?? 0) / 100;
  if (Math.abs(spendRatio - progressRatio) <= 0.15) score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getTrustLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: 'emerald' };
  if (score >= 70) return { label: 'Good', color: 'blue' };
  if (score >= 50) return { label: 'Fair', color: 'amber' };
  return { label: 'At Risk', color: 'red' };
}

export function aggregateWardStats(wardId, projects, payments) {
  const wardProjects = projects.filter((p) => p.wardId === wardId);
  const wardProjectIds = new Set(wardProjects.map((p) => p.id));
  const wardPayments = payments.filter((p) => wardProjectIds.has(p.projectId));

  return {
    projectCount: wardProjects.length,
    totalBudget: wardProjects.reduce((s, p) => s + p.budget, 0),
    totalSpent: wardPayments.reduce((s, p) => s + p.amount, 0),
    avgProgress: wardProjects.length
      ? Math.round(wardProjects.reduce((s, p) => s + (p.progress ?? 0), 0) / wardProjects.length)
      : 0,
  };
}
