import { formatCurrency, formatDate } from './formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
  getTotalPaid,
  getBudgetUsedPercent,
} from './riskEngine';

export function generateCitizenExplanation(project) {
  const paid = getTotalPaid(project);
  const remaining = Math.max(0, (project.allocatedBudget ?? 0) - paid);
  const budgetUsed = getBudgetUsedPercent(project);
  const trust = calculateTrustScore(project);
  const risk = getRiskLevel(project);
  const flags = getRiskFlags(project);
  const proofs = project.proofs ?? [];
  const complaints = project.complaints ?? [];

  const proofSummary = proofs.length === 0
    ? 'No photo or document proofs have been uploaded yet, which means citizens cannot independently verify work on the ground.'
    : `Officials have uploaded ${proofs.length} proof item(s) including ${proofs.filter((p) => p.type === 'before').length} before, ${proofs.filter((p) => p.type === 'during').length} during, ${proofs.filter((p) => p.type === 'after').length} after, and ${proofs.filter((p) => p.type === 'document').length} document record(s).`;

  const tenderNote = project.tenderAmount > project.allocatedBudget
    ? ` The awarded tender of ${formatCurrency(project.tenderAmount)} is higher than the allocated budget — this may require council approval.`
    : '';

  const riskNote = flags.length === 0
    ? 'No major risk flags are currently active on this project.'
    : `Citizens should note ${flags.length} concern(s): ${flags.map((f) => f.label.toLowerCase()).join(', ')}. The transparency trust score is ${trust}/100 (${risk.label}).`;

  const complaintNote = complaints.length > 0
    ? ` ${complaints.length} citizen complaint(s) have been filed, with ${complaints.filter((c) => c.status === 'Pending' || c.status === 'Under Review').length} still open for review.`
    : '';

  return [
    `This is "${project.title}" in Ward ${project.wardNo}, currently marked as ${project.status} with ${project.progressPercent}% physical progress.`,
    `The ward allocated ${formatCurrency(project.allocatedBudget)} for this ${project.category.toLowerCase()} project.${tenderNote}`,
    project.contractorName
      ? `${project.contractorName} was selected as the contractor under a tender worth ${formatCurrency(project.tenderAmount)}.`
      : 'A contractor has not yet been assigned — the project may still be in planning or tender stage.',
    `So far, ${formatCurrency(paid)} has been released in payments (${budgetUsed}% of the allocated budget), leaving ${formatCurrency(remaining)} remaining.`,
    proofSummary,
    riskNote + complaintNote,
    `Work began on ${formatDate(project.startDate)} with a deadline of ${formatDate(project.deadline)}. You can review every payment, proof photo, and citizen complaint on this public page.`,
  ].join('\n\n');
}
