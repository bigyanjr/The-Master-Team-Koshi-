/**
 * AI Transparency Summary — local fallback + optional Gemini API.
 * Set VITE_AI_API_KEY in a local .env file to enable live AI summaries.
 */

import { formatCurrency, formatDate } from './formatters';
import {
  calculateTrustScore,
  getRiskFlags,
  getRiskLevel,
  getTotalPaid,
  getBudgetUsedPercent,
} from './riskEngine';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function proofs(project) {
  return project.proofs ?? [];
}

function payments(project) {
  return project.payments ?? [];
}

function complaints(project) {
  return project.complaints ?? [];
}

/** Structured facts shared by local and AI summaries. */
export function buildProjectContext(project) {
  const paid = getTotalPaid(project);
  const allocated = project.allocatedBudget ?? 0;
  const remaining = Math.max(0, allocated - paid);
  const budgetUsed = getBudgetUsedPercent(project);
  const projectProofs = proofs(project);
  const projectPayments = payments(project);
  const projectComplaints = complaints(project);
  const flags = getRiskFlags(project);
  const trust = calculateTrustScore(project);
  const risk = getRiskLevel(project);

  const proofCounts = {
    before: projectProofs.filter((p) => p.type === 'before').length,
    during: projectProofs.filter((p) => p.type === 'during').length,
    after: projectProofs.filter((p) => p.type === 'after').length,
    document: projectProofs.filter((p) => p.type === 'document').length,
  };

  const openComplaints = projectComplaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review',
  ).length;

  const paymentsMissingProof = projectPayments.filter((pay) => {
    const payDate = new Date(pay.date);
    return !projectProofs.some((p) => new Date(p.uploadedAt) >= payDate);
  }).length;

  return {
    title: project.title,
    wardNo: project.wardNo,
    category: project.category,
    status: project.status,
    location: project.location,
    description: project.description,
    allocatedBudget: allocated,
    allocatedBudgetFormatted: formatCurrency(allocated),
    tenderAmount: project.tenderAmount ?? 0,
    tenderAmountFormatted: formatCurrency(project.tenderAmount ?? 0),
    tenderExceedsBudget: (project.tenderAmount ?? 0) > allocated,
    contractorName: project.contractorName,
    totalPaid: paid,
    totalPaidFormatted: formatCurrency(paid),
    remainingFormatted: formatCurrency(remaining),
    budgetUsedPercent: budgetUsed,
    progressPercent: project.progressPercent ?? 0,
    startDate: project.startDate,
    startDateFormatted: formatDate(project.startDate),
    deadline: project.deadline,
    deadlineFormatted: formatDate(project.deadline),
    proofCount: projectProofs.length,
    proofCounts,
    paymentCount: projectPayments.length,
    complaintCount: projectComplaints.length,
    openComplaints,
    paymentsMissingProof,
    trustScore: trust,
    riskLabel: risk.label,
    riskFlags: flags.map((f) => ({ label: f.label, description: f.description })),
  };
}

/**
 * Mode 1 — Local fallback summary (always available, no API needed).
 */
export function generateCitizenSummary(project) {
  const ctx = buildProjectContext(project);

  const about = [
    `"${ctx.title}" is a ${ctx.category.toLowerCase()} project in Ward ${ctx.wardNo}, at ${ctx.location}.`,
    ctx.description,
    `The ward has marked this project as "${ctx.status}" with ${ctx.progressPercent}% work completed so far.`,
  ].join(' ');

  const budget = [
    `The ward allocated ${ctx.allocatedBudgetFormatted} for this project.`,
    ctx.tenderExceedsBudget
      ? `The approved tender amount is ${ctx.tenderAmountFormatted}, which is higher than the allocated budget. Citizens may wish to check whether extra approval was obtained.`
      : `The approved tender amount is ${ctx.tenderAmountFormatted}.`,
  ].join(' ');

  const contractor = ctx.contractorName
    ? `${ctx.contractorName} is listed as the contractor for this work.`
    : 'No contractor has been assigned yet. The project may still be in planning or open tender.';

  const payments = ctx.paymentCount === 0
    ? 'No payments have been recorded on the public ledger yet.'
    : `${ctx.totalPaidFormatted} has been released in ${ctx.paymentCount} payment(s) — about ${ctx.budgetUsedPercent}% of the allocated budget. ${ctx.remainingFormatted} remains unspent according to official records.`;

  const progress = ctx.progressPercent >= 100
    ? 'Official records show the project as fully complete (100% progress).'
    : `Official progress is reported at ${ctx.progressPercent}%. Work started on ${ctx.startDateFormatted} and the deadline is ${ctx.deadlineFormatted}.`;

  let proofText;
  if (ctx.proofCount === 0) {
    proofText = 'No photos or documents have been uploaded as proof. Citizens cannot yet verify work on the ground from this portal alone.';
  } else {
    const parts = [];
    if (ctx.proofCounts.before) parts.push(`${ctx.proofCounts.before} before-work photo(s)`);
    if (ctx.proofCounts.during) parts.push(`${ctx.proofCounts.during} during-work photo(s)`);
    if (ctx.proofCounts.after) parts.push(`${ctx.proofCounts.after} after-work photo(s)`);
    if (ctx.proofCounts.document) parts.push(`${ctx.proofCounts.document} document(s)`);
    proofText = `Officials have uploaded ${ctx.proofCount} proof item(s): ${parts.join(', ')}. You can view these in the proof gallery on this page.`;
  }

  const concerns = [];
  if (ctx.riskFlags.length === 0) {
    concerns.push('No major transparency concerns are flagged by the system at this time.');
  } else {
    concerns.push(`The transparency score is ${ctx.trustScore}/100 (${ctx.riskLabel}). Citizens may wish to note these points:`);
    ctx.riskFlags.forEach((f) => concerns.push(`• ${f.label}: ${f.description}`));
  }

  if (ctx.paymentsMissingProof > 0) {
    concerns.push(`• ${ctx.paymentsMissingProof} payment release(s) do not yet have matching proof on record.`);
  }

  if (ctx.complaintCount > 0) {
    concerns.push(`• ${ctx.complaintCount} citizen feedback submission(s) have been filed${ctx.openComplaints > 0 ? `, with ${ctx.openComplaints} still awaiting ward review` : ''}. Feedback is public concern, not verified proof.`);
  }

  return [
    about,
    budget,
    contractor,
    payments,
    progress,
    proofText,
    concerns.join('\n'),
  ].join('\n\n');
}

function buildAIPrompt(project) {
  const ctx = buildProjectContext(project);
  return `You are helping citizens in Itahari Sub-Metropolitan City, Koshi Province, Nepal understand a ward public project on a transparency portal.

Write a clear public summary in simple English that Nepali citizens can easily read. Rules:
- Neutral, factual, accountability-focused tone
- No political accusations or blame
- No technical jargon or legal language
- Short paragraphs (4–7 paragraphs total)
- Do not invent facts — use only the data below

Cover these topics:
1. What the project is about
2. Allocated budget and approved tender amount
3. Who the contractor is (if assigned)
4. How much has been paid so far
5. Reported physical progress
6. What proof photos/documents exist
7. Any risks or missing evidence citizens should notice

Project data (JSON):
${JSON.stringify(ctx, null, 2)}`;
}

/**
 * Mode 2 — Optional Gemini API call. Throws on failure; caller should fall back.
 */
export async function callAISummary(project, apiKey = import.meta.env.VITE_AI_API_KEY) {
  if (!apiKey?.trim()) {
    throw new Error('VITE_AI_API_KEY is not configured');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildAIPrompt(project) }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error (${response.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error('Gemini API returned an empty summary');
  }

  return text;
}

/**
 * Primary entry — tries AI when key is present, otherwise local fallback.
 * Never throws; always returns a summary string.
 */
export async function getPublicSummary(project) {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  if (apiKey?.trim()) {
    try {
      const summary = await callAISummary(project, apiKey);
      return { summary, source: 'ai' };
    } catch (err) {
      console.warn('[aiSummary] API unavailable, using local fallback:', err.message);
    }
  }

  return {
    summary: generateCitizenSummary(project),
    source: 'local',
  };
}

export function hasAIConfigured() {
  return Boolean(import.meta.env.VITE_AI_API_KEY?.trim());
}
