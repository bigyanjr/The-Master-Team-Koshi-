/**
 * Governance / corruption-risk detector — neutral accountability language only.
 * Does not accuse individuals; flags transparency concerns for verification.
 */

const SEVERITY_PENALTY = { high: 25, medium: 15, low: 8 };

const FLAG_DEFS = {
  PAYMENT_WITHOUT_PROOF: {
    id: 'PAYMENT_WITHOUT_PROOF',
    label: 'Payment released without public proof',
    severity: 'high',
    description: 'Payments are on record but no supporting photos or documents have been published for citizens to verify.',
  },
  BUDGET_PROGRESS_MISMATCH: {
    id: 'BUDGET_PROGRESS_MISMATCH',
    label: 'Budget-progress mismatch',
    severity: 'high',
    description: 'More than 70% of the budget has been used while reported physical progress remains below 50%. Needs verification.',
  },
  DELAYED_BEYOND_DEADLINE: {
    id: 'DELAYED_BEYOND_DEADLINE',
    label: 'Project delayed beyond deadline',
    severity: 'medium',
    description: 'The official deadline has passed but the project is not yet marked complete. Transparency concern for citizens.',
  },
  TENDER_EXCEEDS_BUDGET: {
    id: 'TENDER_EXCEEDS_BUDGET',
    label: 'Tender exceeds allocated budget',
    severity: 'high',
    description: 'The approved tender amount is higher than the ward allocated budget. Missing public evidence of additional approval.',
  },
  COMPLETION_PROOF_MISSING: {
    id: 'COMPLETION_PROOF_MISSING',
    label: 'Completion proof missing',
    severity: 'medium',
    description: 'Project is marked completed but no after photos or completion documents are available on the public portal.',
  },
  HIGH_CITIZEN_CONCERN: {
    id: 'HIGH_CITIZEN_CONCERN',
    label: 'High citizen concern',
    severity: 'medium',
    description: 'More than five citizen feedback submissions have been filed. Ward review is recommended.',
  },
  CONTRACTOR_CONCENTRATION: {
    id: 'CONTRACTOR_CONCENTRATION',
    label: 'Contractor concentration risk',
    severity: 'medium',
    description: 'The same contractor holds more than three active ward projects. Potential governance risk worth monitoring.',
  },
  HIGH_SPENDING_INCOMPLETE: {
    id: 'HIGH_SPENDING_INCOMPLETE',
    label: 'High spending with incomplete progress',
    severity: 'high',
    description: 'Over 90% of the budget has been spent while reported progress remains below 80%. Needs verification.',
  },
};

function getTotalPaid(project) {
  return payments(project).reduce((sum, p) => sum + (p.amount ?? 0), 0);
}

function getBudgetUsedPercent(project) {
  const allocated = project.allocatedBudget ?? 0;
  if (allocated <= 0) return 0;
  return Math.round((getTotalPaid(project) / allocated) * 100);
}

function getProgressPercent(project) {
  return project.progressPercent ?? 0;
}

function payments(project) {
  return project.payments ?? [];
}

function proofs(project) {
  return project.proofs ?? [];
}

function complaints(project) {
  return project.complaints ?? [];
}

function isDeadlinePassed(project) {
  if (!project.deadline) return false;
  const deadline = new Date(project.deadline);
  deadline.setHours(23, 59, 59, 999);
  return deadline < new Date();
}

function hasCompletionProof(project) {
  return proofs(project).some((p) => p.type === 'after' || p.type === 'document');
}

function isActiveProject(project) {
  const status = (project.status ?? '').toLowerCase();
  return !['completed', 'planned'].includes(status);
}

function countActiveProjectsForContractor(contractorName, allProjects) {
  if (!contractorName?.trim()) return 0;
  const normalized = contractorName.trim().toLowerCase();
  return allProjects.filter(
    (p) => isActiveProject(p) && p.contractorName?.trim().toLowerCase() === normalized,
  ).length;
}

function latestPaymentMissingProof(project) {
  const projectPayments = payments(project);
  const projectProofs = proofs(project);
  if (!projectPayments.length) return false;

  const sorted = [...projectPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];
  const payDate = new Date(latest.date);
  return !projectProofs.some((p) => new Date(p.uploadedAt) >= payDate);
}

/**
 * Detect governance / transparency risk flags for a project.
 */
export function detectCorruptionRisks(project, allProjects = []) {
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

  if (progress < 50 && budgetUsed > 70) {
    flags.push(FLAG_DEFS.BUDGET_PROGRESS_MISMATCH);
  }

  if (isDeadlinePassed(project) && progress < 100) {
    flags.push(FLAG_DEFS.DELAYED_BEYOND_DEADLINE);
  }

  if ((project.tenderAmount ?? 0) > (project.allocatedBudget ?? 0)) {
    flags.push(FLAG_DEFS.TENDER_EXCEEDS_BUDGET);
  }

  if (status === 'Completed' && !hasCompletionProof(project)) {
    flags.push(FLAG_DEFS.COMPLETION_PROOF_MISSING);
  }

  if (complaintCount > 5) {
    flags.push(FLAG_DEFS.HIGH_CITIZEN_CONCERN);
  }

  const contractorActiveCount = countActiveProjectsForContractor(project.contractorName, allProjects);
  if (contractorActiveCount > 3) {
    flags.push({
      ...FLAG_DEFS.CONTRACTOR_CONCENTRATION,
      description: `${project.contractorName} is listed on ${contractorActiveCount} active ward projects. Potential governance risk worth monitoring.`,
    });
  }

  if (budgetUsed > 90 && progress < 80) {
    flags.push(FLAG_DEFS.HIGH_SPENDING_INCOMPLETE);
  }

  return flags;
}

export function getCorruptionRiskScore(project, allProjects = []) {
  let score = 100;
  const flags = detectCorruptionRisks(project, allProjects);

  flags.forEach((flag) => {
    score -= SEVERITY_PENALTY[flag.severity] ?? 10;
  });

  return Math.max(0, Math.min(100, score));
}

export function getCorruptionRiskLevel(project, allProjects = []) {
  const score = getCorruptionRiskScore(project, allProjects);

  if (score >= 80) {
    return { label: 'Low Risk', color: 'emerald', score };
  }
  if (score >= 50) {
    return { label: 'Medium Risk', color: 'amber', score };
  }
  return { label: 'High Risk', color: 'red', score };
}

/**
 * Plain-language red-flag explanation for citizens (auto-generated).
 */
export function generateRiskExplanation(project, allProjects = []) {
  const flags = detectCorruptionRisks(project, allProjects);
  const budgetUsed = getBudgetUsedPercent(project);
  const progress = getProgressPercent(project);
  const paid = getTotalPaid(project);

  if (flags.length === 0) {
    return 'No major transparency concerns are flagged on this project. Public budget, payment, and proof records appear consistent with reported progress.';
  }

  const parts = [];

  if (flags.some((f) => f.id === 'BUDGET_PROGRESS_MISMATCH' || f.id === 'HIGH_SPENDING_INCOMPLETE')) {
    parts.push(
      `${budgetUsed}% of the approved budget has been used, but only ${progress}% progress has been reported`,
    );
  }

  if (flags.some((f) => f.id === 'PAYMENT_WITHOUT_PROOF')) {
    parts.push('public proof is missing for recorded payments');
  } else if (latestPaymentMissingProof(project)) {
    parts.push('public proof is incomplete for the latest payment');
  }

  if (flags.some((f) => f.id === 'DELAYED_BEYOND_DEADLINE')) {
    parts.push('the project has passed its deadline without completion');
  }

  if (flags.some((f) => f.id === 'TENDER_EXCEEDS_BUDGET')) {
    parts.push('the tender amount exceeds the allocated budget');
  }

  if (flags.some((f) => f.id === 'COMPLETION_PROOF_MISSING')) {
    parts.push('completion proof has not been published despite completed status');
  }

  if (flags.some((f) => f.id === 'HIGH_CITIZEN_CONCERN')) {
    parts.push('multiple citizen feedback submissions are on record');
  }

  if (flags.some((f) => f.id === 'CONTRACTOR_CONCENTRATION')) {
    parts.push('the contractor holds several other active ward contracts');
  }

  if (parts.length === 0) {
    const flagLabels = flags.map((f) => f.label.toLowerCase()).join(', ');
    return `This project needs verification because the system flagged: ${flagLabels}. Citizens may wish to review payments and proofs on this page.`;
  }

  const narrative = parts.join(', and ');
  const paymentNote = paid > 0 ? ` A total of NPR ${paid.toLocaleString('en-NP')} has been released so far.` : '';

  return `This project needs verification because ${narrative}.${paymentNote} These are transparency concerns — not proven wrongdoing — and ward officials should review the public record.`;
}

/** Alias for dashboard / card use. */
export function getGovernanceRiskSummary(project, allProjects = []) {
  return {
    score: getCorruptionRiskScore(project, allProjects),
    level: getCorruptionRiskLevel(project, allProjects),
    flags: detectCorruptionRisks(project, allProjects),
    explanation: generateRiskExplanation(project, allProjects),
  };
}
