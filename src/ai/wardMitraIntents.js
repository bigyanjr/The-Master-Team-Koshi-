const GREETING_KEYWORDS = [
  'hi',
  'hello',
  'hey',
  'namaste',
  'namaskar',
  'mero sathi',
  'help',
];

const IDENTITY_KEYWORDS = [
  'who are you',
  'what are you',
  'timi ko ho',
  'tapai ko ho',
  'who is ward mitra',
  'ward mitra ko ho',
  'timi k ho',
  'tapai k ho',
];

const WARDWATCH_HISTORY_KEYWORDS = [
  'wardwatch history',
  'wardwatch purpose',
  'why wardwatch',
  'why was wardwatch',
  'what is wardwatch',
  'wardwatch k ho',
  'wardwatch banako',
  'wardwatch kina banayo',
  'good governance solution',
  'why was it created',
  'who made wardwatch',
];

const DEFINITION_PATTERNS = [
  { topic: 'budget_transparency', patterns: ['budget transparency', 'budget transparency vaneko', 'parda transparen'] },
  { topic: 'good_governance', patterns: ['good governance', 'good governance vaneko', 'ramro sasan'] },
  { topic: 'public_procurement', patterns: ['public procurement', 'public procurement vaneko', 'sarkari khareji'] },
  { topic: 'tender', patterns: ['what is tender', 'tender vaneko', 'tender k ho', 'what is a tender'] },
  { topic: 'contractor', patterns: ['what is contractor', 'contractor vaneko', 'thekedar vaneko', 'what is a contractor'] },
  { topic: 'ward_budget', patterns: ['ward budget', 'ward budget vaneko', 'wada budget', 'wada ko budget k ho'] },
  { topic: 'citizen_complaint', patterns: ['citizen complaint', 'complaint vaneko', 'nagarik guna', 'citizen feedback vaneko'] },
  { topic: 'proof_upload', patterns: ['proof upload', 'proof upload vaneko', 'praman upload', 'photo proof vaneko'] },
  { topic: 'risk_flag', patterns: ['risk flag', 'risk flag vaneko', 'transparency risk vaneko', 'what is risk flag'] },
  { topic: 'trust_score', patterns: ['trust score', 'trust score vaneko', 'what is trust score', 'biswas score'] },
  { topic: 'public_accountability', patterns: ['public accountability', 'accountability vaneko', 'jawafdehi'] },
  { topic: 'qr_transparency', patterns: ['qr transparency', 'qr board', 'qr scan vaneko', 'qr transparency board'] },
];

const PROJECT_QUERY_KEYWORDS = [
  'ward',
  'wada',
  'budget',
  'project',
  'payment',
  'contractor',
  'tender',
  'complaint',
  'proof',
  'delayed',
  'delay',
  'risky',
  'risk',
  'progress',
  'paid',
  'spent',
  'spending',
  'kharcha',
  'paisa',
  'yojana',
  'contract',
  'vendor',
  'deadline',
  'allocate',
  'show high',
  'which project',
  'where did',
  'who got',
  'list project',
];

function normalize(question) {
  return question.trim().toLowerCase().replace(/\s+/g, ' ');
}

function containsAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function isGreetingOnly(text) {
  const stripped = text.replace(/[!?.,"']/g, '').trim();
  if (GREETING_KEYWORDS.includes(stripped)) return true;
  return /^(hi|hello|hey|namaste|namaskar)(\s+(there|mitra|ward mitra|sathi|friend))?$/i.test(stripped);
}

export function detectDefinitionTopic(question) {
  const q = normalize(question);
  for (const { topic, patterns } of DEFINITION_PATTERNS) {
    if (patterns.some((p) => q.includes(p))) return topic;
  }
  if (/^what is (a |an |the )?\w+/i.test(question) || /vaneko k ho/i.test(q)) {
    if (q.includes('tender')) return 'tender';
    if (q.includes('contractor') || q.includes('thekedar')) return 'contractor';
    if (q.includes('trust')) return 'trust_score';
    if (q.includes('risk')) return 'risk_flag';
    if (q.includes('proof')) return 'proof_upload';
    if (q.includes('complaint') || q.includes('feedback')) return 'citizen_complaint';
    if (q.includes('governance')) return 'good_governance';
    if (q.includes('procurement')) return 'public_procurement';
    if (q.includes('accountability')) return 'public_accountability';
    if (q.includes('qr')) return 'qr_transparency';
    if (q.includes('budget')) return q.includes('ward') || q.includes('wada') ? 'ward_budget' : 'budget_transparency';
  }
  return null;
}

/**
 * @returns {'greeting'|'identity'|'wardwatch_history'|'definition'|'project_query'|'unknown'}
 */
export function detectWardMitraIntent(question) {
  if (!question?.trim()) return 'unknown';

  const q = normalize(question);

  if (containsAny(q, IDENTITY_KEYWORDS)) return 'identity';
  if (containsAny(q, WARDWATCH_HISTORY_KEYWORDS)) return 'wardwatch_history';
  if (detectDefinitionTopic(question)) return 'definition';

  const hasProjectSignal = containsAny(q, PROJECT_QUERY_KEYWORDS);
  if (hasProjectSignal) return 'project_query';

  if (containsAny(q, GREETING_KEYWORDS) && (isGreetingOnly(q) || q.length <= 40)) {
    return 'greeting';
  }

  if (/^(hi|hello|hey|namaste|namaskar)\b/i.test(q) && !hasProjectSignal) {
    return 'greeting';
  }

  return 'unknown';
}
