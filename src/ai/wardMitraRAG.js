/**
 * RAG (retrieve-then-generate) answering for Ward Mitra's data questions.
 *
 * "Retrieval" here doesn't need a vector database — Itahari's ward/project
 * data is small and already structured, so the retrieval step is simply:
 * pull the real records for the ward (and category) the citizen asked
 * about, using the same extraction logic the old rule-based engine used
 * (see citizenQueryEngine.buildRetrievalContext). Those real records are
 * then handed to Gemini with strict instructions to answer only from that
 * data — never invent numbers — which is the "generation" step.
 *
 * Always falls back to the deterministic, template-based engine
 * (answerCitizenQuery) if no API key is configured, the retrieved context
 * is empty, or the Gemini call fails for any reason — citizens should never
 * see a blank or broken answer just because the AI call didn't work.
 */

import { callGemini } from '../utils/geminiClient';
import { answerCitizenQuery, buildRetrievalContext } from '../utils/citizenQueryEngine';
import { PRODUCT_NAME } from '../config/branding';

function buildRagPrompt(question, context) {
  return `You are Ward Mitra, a civic transparency assistant for ${PRODUCT_NAME} in Itahari Sub-Metropolitan City, Nepal.

Answer the citizen's question using ONLY the ward/project data given below.
Rules:
- Never invent budget figures, contractor names, payments, dates, or any fact not present in the data.
- If the data below does not contain enough information to answer, say so plainly instead of guessing.
- Reply in the same language style as the question — plain English, or Romanized/Devanagari Nepali if the question is written that way.
- Be short and conversational: 2-5 sentences, citizen-friendly, no jargon, no markdown formatting, no headings.
- If multiple projects are relevant, summarize the key ones rather than listing every field for every project.

Ward/project data (JSON — this is the complete set of real records available to answer from):
${JSON.stringify(context, null, 2)}

Note on "officialWardBudget": if present, this is the ward's authoritative
total budget as set by the ward office — always prefer it over adding up
individual projects' allocatedBudget when answering "what is the ward's
total/overall budget". The per-project allocatedBudget figures are about
each individual project only, not the ward's full budget.

Citizen's question: "${question}"`;
}

/**
 * @returns {Promise<{ answer: string, source: 'ai'|'local', wardNo: number|null, projectCount: number }>}
 */
export async function answerCitizenQueryWithRAG(
  question,
  projects,
  wards,
  apiKey = import.meta.env.VITE_AI_API_KEY,
  getWardBudgetSummary,
) {
  const fallback = () => ({
    answer: answerCitizenQuery(question, projects, wards, getWardBudgetSummary),
    source: 'local',
    wardNo: null,
    projectCount: projects?.length ?? 0,
  });

  if (!apiKey?.trim()) {
    return fallback();
  }

  let context;
  try {
    context = buildRetrievalContext(question, projects, wards, getWardBudgetSummary);
  } catch (err) {
    console.warn('[wardMitraRAG] Retrieval failed, using local fallback:', err.message);
    return fallback();
  }

  // Nothing real to ground the answer in (e.g. citizen named a ward with no
  // published projects, and no official ward budget has been set either) —
  // let the deterministic engine give its precise "no public projects for
  // Ward X" message instead of letting the model guess or hedge.
  if (context.projectCount === 0 && !context.officialWardBudget) {
    return fallback();
  }

  try {
    const answer = await callGemini(buildRagPrompt(question, context), apiKey, { temperature: 0.3 });
    return { answer, source: 'ai', wardNo: context.wardNo, projectCount: context.projectCount };
  } catch (err) {
    console.warn('[wardMitraRAG] Gemini unavailable, using local fallback:', err.message);
    return fallback();
  }
}
