import { NO_PUBLIC_PROJECTS_MESSAGE } from '../utils/citizenQueryEngine';
import { answerCitizenQueryWithRAG } from './wardMitraRAG';
import {
  buildGreeting,
  IDENTITY_ANSWER,
  WARDWATCH_HISTORY_ANSWER,
  UNKNOWN_FALLBACK_HINT,
  WARD_MITRA_NAME,
} from './wardMitraConfig';
import { detectDefinitionTopic, detectWardMitraIntent } from './wardMitraIntents';
import { getDefinitionAnswer } from './wardMitraKnowledgeBase';

/**
 * @param {{ question: string, userProfile?: object|null, projects: array, wards: array, getWardBudgetSummary?: function }}
 * @returns {Promise<{ answer: string, intent: string, source: 'ward_mitra'|'knowledge_base'|'project_data'|'fallback' }>}
 */
export async function respondAsWardMitra({ question, userProfile = null, projects, wards, getWardBudgetSummary }) {
  const trimmed = question?.trim() ?? '';
  const intent = detectWardMitraIntent(trimmed);

  switch (intent) {
    case 'greeting':
      return {
        answer: buildGreeting(userProfile),
        intent,
        source: 'ward_mitra',
      };

    case 'identity':
      return {
        answer: IDENTITY_ANSWER,
        intent,
        source: 'ward_mitra',
      };

    case 'wardwatch_history':
      return {
        answer: WARDWATCH_HISTORY_ANSWER,
        intent,
        source: 'ward_mitra',
      };

    case 'definition': {
      const topic = detectDefinitionTopic(trimmed);
      const answer = getDefinitionAnswer(topic, trimmed);
      if (answer) {
        return { answer, intent, source: 'knowledge_base' };
      }
      return {
        answer: `I am ${WARD_MITRA_NAME}. I can explain budget transparency, tenders, trust scores, risk flags, and more. ${UNKNOWN_FALLBACK_HINT}`,
        intent: 'definition',
        source: 'fallback',
      };
    }

    case 'project_query': {
      if (!projects?.length) {
        return { answer: NO_PUBLIC_PROJECTS_MESSAGE, intent, source: 'fallback' };
      }
      // Retrieval-augmented: pulls the real ward/project records (and the
      // official ward budget, if set) relevant to this question and has
      // Gemini write the actual answer from them, falling back to the
      // deterministic engine if no API key / failure.
      const { answer, source } = await answerCitizenQueryWithRAG(
        trimmed,
        projects,
        wards,
        undefined,
        getWardBudgetSummary,
      );
      return { answer, intent, source: source === 'ai' ? 'project_data_ai' : 'project_data' };
    }

    case 'unknown':
    default: {
      // No keyword matched a known intent — the deterministic engine's
      // answerGeneral() already returns a complete "try asking about..."
      // help message on its own, so just return that directly instead of
      // also prepending UNKNOWN_FALLBACK_HINT (that used to double up into
      // two near-identical "try asking about ward budgets..." paragraphs).
      const { answer: engineAnswer, source } = await answerCitizenQueryWithRAG(
        trimmed,
        projects,
        wards,
        undefined,
        getWardBudgetSummary,
      );

      return {
        answer: engineAnswer,
        intent: 'unknown',
        source: source === 'ai' ? 'project_data_ai' : 'fallback',
      };
    }
  }
}
