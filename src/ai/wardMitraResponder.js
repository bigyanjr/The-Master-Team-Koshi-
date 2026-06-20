import { answerCitizenQuery, NO_PUBLIC_PROJECTS_MESSAGE } from '../utils/citizenQueryEngine';
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
 * @param {{ question: string, userProfile?: object|null, projects: array, wards: array }}
 * @returns {{ answer: string, intent: string, source: 'ward_mitra'|'knowledge_base'|'project_data'|'fallback' }}
 */
export function respondAsWardMitra({ question, userProfile = null, projects, wards }) {
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
      const answer = answerCitizenQuery(trimmed, projects, wards);
      return { answer, intent, source: 'project_data' };
    }

    case 'unknown':
    default: {
      const engineAnswer = answerCitizenQuery(trimmed, projects, wards);
      const isGenericHelp = /try asking about|Ma .* ko public data|I answer from/i.test(engineAnswer);

      if (isGenericHelp && trimmed.length > 0) {
        return {
          answer: `${UNKNOWN_FALLBACK_HINT}\n\n${engineAnswer}`,
          intent: 'unknown',
          source: 'fallback',
        };
      }

      return {
        answer: engineAnswer,
        intent: intent === 'unknown' ? 'unknown' : intent,
        source: 'project_data',
      };
    }
  }
}
