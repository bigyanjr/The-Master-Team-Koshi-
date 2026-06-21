/**
 * Shared Gemini API caller — used by both the per-project AI summary
 * (aiSummary.js) and the Ward Mitra RAG chatbot (ai/wardMitraRAG.js) so
 * there's one place that knows how to talk to Gemini.
 *
 * Requires VITE_AI_API_KEY in .env. Throws on any failure — callers are
 * expected to catch and fall back to a local, non-AI answer (never leave a
 * citizen with a blank response just because the API key is missing or the
 * network call failed).
 */

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function callGemini(prompt, apiKey, { temperature = 0.3, maxOutputTokens = 1024 } = {}) {
  if (!apiKey?.trim()) {
    throw new Error('VITE_AI_API_KEY is not configured');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error (${response.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error('Gemini API returned an empty response');
  }

  return text;
}
