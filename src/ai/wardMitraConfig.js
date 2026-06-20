import { PRODUCT_NAME } from '../config/branding';

export const WARD_MITRA_NAME = 'Ward Mitra';

export const WARD_MITRA_IDENTITY = {
  name: WARD_MITRA_NAME,
  role: `Civic assistant for ${PRODUCT_NAME}`,
  purpose:
    'Help citizens understand Itahari ward budgets, projects, payments, proof photos, progress, and feedback.',
};

export const WARD_MITRA_INTRO =
  'Namaste, I am Ward Mitra. Ask me about ward budgets, projects, payments, proof, or feedback in simple words.';

export function getFirstName(userProfile) {
  const name = userProfile?.fullName?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0];
}

export function buildGreeting(userProfile) {
  const first = getFirstName(userProfile);
  if (first) {
    return `Hi ${first}, I am ${WARD_MITRA_NAME}. I can help you understand Itahari ward spending, projects, and payments. What would you like to know?`;
  }
  return `Hi, I am ${WARD_MITRA_NAME}. I can help you understand Itahari ward spending, projects, and payments. What would you like to know?`;
}

export const IDENTITY_ANSWER =
  `I am ${WARD_MITRA_NAME}, the civic assistant for ${PRODUCT_NAME}. I explain ward budgets, projects, payments, progress, and feedback in plain language.`;

export const WARDWATCH_HISTORY_ANSWER =
  `${PRODUCT_NAME} helps citizens follow local ward spending. It brings together budget, contractor details, payments, proof photos, progress updates, and citizen feedback in one public place.`;

export const UNKNOWN_FALLBACK_HINT =
  'Try asking about ward budgets, projects, payments, contractors, delays, or feedback. For example: "Where did Ward 3 budget go?" or "Which projects are delayed?"';
