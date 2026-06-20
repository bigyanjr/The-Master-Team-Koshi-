/**
 * Risk & trust scoring for WardWatch projects.
 * Each project carries nested payments, proofs, and complaints.
 */

import {
  detectCorruptionRisks,
  getCorruptionRiskScore,
  getCorruptionRiskLevel,
  generateRiskExplanation as generateRiskExplanationFromDetector,
} from './corruptionRiskDetector';

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

export function syncProjectTotals(project) {
  const paidAmount = getTotalPaid(project);
  return {
    ...project,
    paidAmount,
    updatedAt: new Date().toISOString(),
  };
}

export const INSUFFICIENT_RISK_DATA_LABEL = 'Not enough public data yet';

export function hasEnoughRiskData(project) {
  if (!project) return false;
  const hasPayments = payments(project).length > 0;
  const hasProofs = proofs(project).length > 0;
  const hasComplaints = complaints(project).length > 0;
  const hasProgress = (project.progressPercent ?? 0) > 0;
  return hasPayments || hasProofs || hasComplaints || hasProgress;
}

export function getRiskFlags(project, allProjects = []) {
  if (!hasEnoughRiskData(project)) return [];
  return detectCorruptionRisks(project, allProjects);
}

export function calculateTrustScore(project, allProjects = []) {
  if (!hasEnoughRiskData(project)) return null;
  return getCorruptionRiskScore(project, allProjects);
}

export function getRiskLevel(project, allProjects = []) {
  if (!hasEnoughRiskData(project)) {
    return {
      label: INSUFFICIENT_RISK_DATA_LABEL,
      color: 'slate',
      score: null,
      insufficientData: true,
    };
  }
  return getCorruptionRiskLevel(project, allProjects);
}

export function generateRiskExplanation(project, allProjects = []) {
  if (!hasEnoughRiskData(project)) {
    return 'Not enough public data yet. Risk assessment will appear after ward admins publish payments, proof photos, or progress updates.';
  }
  return generateRiskExplanationFromDetector(project, allProjects);
}

export function getTrustLabel(score) {
  if (score >= 80) return { label: 'Low Risk', color: 'emerald' };
  if (score >= 50) return { label: 'Medium Risk', color: 'amber' };
  return { label: 'High Risk', color: 'red' };
}

export function getProjectHealth(project, allProjects = []) {
  const trustScore = calculateTrustScore(project, allProjects);
  const riskLevel = getRiskLevel(project, allProjects);
  const flags = getRiskFlags(project, allProjects);
  const explanation = generateRiskExplanation(project, allProjects);

  return {
    trustScore,
    riskLevel,
    flags,
    budgetUsedPercent: getBudgetUsedPercent(project),
    progressPercent: getProgressPercent(project),
    totalPaid: getTotalPaid(project),
    complaintCount: complaints(project).length,
    proofCount: proofs(project).length,
    summary: explanation,
    explanation,
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
    avgTrust: (() => {
      const scored = wardProjects
        .map((p) => calculateTrustScore(p, projects))
        .filter((s) => s != null);
      return scored.length
        ? Math.round(scored.reduce((s, v) => s + v, 0) / scored.length)
        : null;
    })(),
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
      projectId: c.projectId || p.id,
      projectTitle: c.projectTitle || p.title,
      wardNo: c.wardNo ?? p.wardNo,
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
