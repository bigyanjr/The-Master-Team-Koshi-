/**
 * Citizen Query Engine — answers ward budget & project questions from public data.
 */

import {
  getTotalPaid,
  getBudgetUsedPercent,
  hasEnoughRiskData,
} from './riskEngine';
import {
  getCorruptionRiskScore,
  getCorruptionRiskLevel,
  detectCorruptionRisks,
  generateRiskExplanation,
} from './corruptionRiskDetector';
import { PRODUCT_NAME } from '../config/branding';
import { formatCurrency, formatCompactCurrency } from './formatters';

const CATEGORY_KEYWORDS = {
  roads: 'Roads',
  road: 'Roads',
  drainage: 'Drainage',
  drain: 'Drainage',
  electrical: 'Electrical',
  light: 'Electrical',
  lights: 'Electrical',
  education: 'Education',
  school: 'Education',
  healthcare: 'Healthcare',
  health: 'Healthcare',
  water: 'Water Supply',
  pipeline: 'Water Supply',
  sanitation: 'Sanitation',
  waste: 'Sanitation',
  park: 'Parks',
  parks: 'Parks',
  footpath: 'Footpath',
  digital: 'Digital Infrastructure',
  market: 'Markets',
};

const ROMAN_NEPALI_MARKERS = /\b(ko|cha|chha|bhayo|bhayeko|kaha|kahaa|kati|kun|sabai|ward|project|budget|kharcha|jancha|hernu|risky|deri|bhayo|lagyo)\b/i;
const DEVANAGARI = /[\u0900-\u097F]/;

function isNepaliStyle(question) {
  return DEVANAGARI.test(question) || ROMAN_NEPALI_MARKERS.test(question);
}

function extractWardNumber(question) {
  const patterns = [
    /ward\s*(\d+)/i,
    /w\s*(\d+)/i,
    /वडा\s*(\d+)/,
    /वडा\s*([०-९]+)/,
  ];
  for (const re of patterns) {
    const m = question.match(re);
    if (m) return Number(m[1].replace(/[०-९]/g, (d) => '०१२३४५६७८९'.indexOf(d)));
  }
  return null;
}

function extractCategory(question) {
  const lower = question.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) return category;
  }
  if (/drainage|nala|खोला/i.test(question)) return 'Drainage';
  if (/road|bato|सडक/i.test(question)) return 'Roads';
  return null;
}

function formatLakh(amount) {
  const lakh = amount / 100000;
  if (lakh >= 1) return `${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} lakh`;
  return formatCompactCurrency(amount);
}

function wardProjects(projects, wardNo) {
  return projects.filter((p) => p.wardNo === wardNo);
}

function delayedProjects(projects) {
  return projects.filter((p) => {
    if (p.status === 'Delayed') return true;
    if (!p.deadline) return false;
    const deadline = new Date(p.deadline);
    deadline.setHours(23, 59, 59, 999);
    return deadline < new Date() && (p.progressPercent ?? 0) < 100;
  });
}

function highRiskProjects(projects) {
  return [...projects]
    .filter((p) => hasEnoughRiskData(p))
    .map((p) => ({ project: p, score: getCorruptionRiskScore(p, projects) }))
    .filter(({ score }) => score < 80)
    .sort((a, b) => a.score - b.score);
}

export const NO_PUBLIC_PROJECTS_MESSAGE =
  'This information has not been published yet.';

export const NO_PUBLISHED_RECORDS_MESSAGE = NO_PUBLIC_PROJECTS_MESSAGE;

function isProjectDataIntent(intent) {
  return ['delayed', 'risk', 'contractor', 'complaint', 'budget', 'progress', 'list'].includes(intent);
}

function matchIntent(question) {
  const q = question.toLowerCase();

  if (/delay|deri|late|deadline|ढिलo|ढिला/i.test(q)) return 'delayed';
  if (/risk|risky|concern|flag|transparency|खतरा|जोखिम/i.test(q)) return 'risk';
  if (/contractor|contract|who got|who is|vendor|ठेकेदार/i.test(q)) return 'contractor';
  if (/complaint|feedback|citizen|गुनासo|गुनासा/i.test(q)) return 'complaint';
  if (/paid|payment|spent|spending|budget|kharcha|go|where|kaha|खर्च/i.test(q)) return 'budget';
  if (/progress|complete|status|kati|percent/i.test(q)) return 'progress';
  if (/how many|list|show|which project|kun project|कुन/i.test(q)) return 'list';

  return 'general';
}

function answerBudgetWard(wardNo, projects, nepali) {
  const list = wardProjects(projects, wardNo);
  if (!list.length) {
    return nepali
      ? `Ward ${wardNo} ko kunaipani project public record ma bh-etikena.`
      : `No public projects were found for Ward ${wardNo}.`;
  }

  const totalBudget = list.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const totalPaid = list.reduce((s, p) => s + getTotalPaid(p), 0);

  if (nepali) {
    const lines = list.map((p) => {
      const paid = getTotalPaid(p);
      const flags = hasEnoughRiskData(p) ? detectCorruptionRisks(p, projects) : [];
      const concern = flags.length
        ? ` System le yo project lai verification required vaneko cha (${flags[0].label}).`
        : '';
      return `• ${p.title}: NPR ${formatLakh(p.allocatedBudget)} allocate, NPR ${formatLakh(paid)} payment, progress ${p.progressPercent}%.${concern}`;
    });
    return `Ward ${wardNo} ma ${list.length} wota project cha. Kul budget NPR ${formatLakh(totalBudget)}, ahile samma NPR ${formatLakh(totalPaid)} kharcha record bhayeko cha.\n\n${lines.join('\n')}`;
  }

  const lines = list.map((p) => {
    const paid = getTotalPaid(p);
    const flags = hasEnoughRiskData(p) ? detectCorruptionRisks(p, projects) : [];
    const concern = flags.length
      ? ` One transparency concern: ${flags[0].label.toLowerCase()}.`
      : '';
    return `• ${p.title}: ${formatCurrency(p.allocatedBudget)} allocated, ${formatCurrency(paid)} paid, ${p.progressPercent}% progress.${concern}`;
  });

  return `Ward ${wardNo} has ${list.length} public project(s). Total allocated budget is ${formatCurrency(totalBudget)} and ${formatCurrency(totalPaid)} has been paid so far.\n\n${lines.join('\n')}`;
}

function answerDelayed(projects, nepali) {
  const delayed = delayedProjects(projects);
  if (!delayed.length) {
    return nepali
      ? 'Ahile kunaipani project delayed vandaina public record anusar.'
      : 'No delayed projects are currently flagged in the public records.';
  }

  if (nepali) {
    return `Delayed vayeka ${delayed.length} wota project:\n${delayed.map((p) => `• Ward ${p.wardNo} — ${p.title} (${p.progressPercent}% progress, deadline ${p.deadline})`).join('\n')}`;
  }

  return `${delayed.length} project(s) are delayed or past deadline:\n${delayed.map((p) => `• Ward ${p.wardNo} — ${p.title} (${p.progressPercent}% progress, deadline ${p.deadline})`).join('\n')}`;
}

function answerHighRisk(projects, nepali) {
  const risky = highRiskProjects(projects);
  if (!risky.length) {
    const hasAnyData = projects.some((p) => hasEnoughRiskData(p));
    if (!hasAnyData) {
      return NO_PUBLIC_PROJECTS_MESSAGE;
    }
    return nepali
      ? 'Sabai project haru ma ahile risk assess garna pugne public data chaina.'
      : 'Not enough public payment, proof, or progress data to assess risk yet.';
  }

  const top = risky.slice(0, 5);
  if (nepali) {
    return `Sabai bhanda high risk project haru:\n${top.map(({ project: p, score }) => {
      const expl = generateRiskExplanation(p, projects).split('.')[0];
      return `• Ward ${p.wardNo} — ${p.title} (risk score ${score}/100). ${expl}.`;
    }).join('\n')}`;
  }

  return `Projects with the highest transparency concerns:\n${top.map(({ project: p, score }) => {
    const level = getCorruptionRiskLevel(p, projects).label;
    return `• Ward ${p.wardNo} — ${p.title} (${level}, score ${score}/100). ${generateRiskExplanation(p, projects).split('.')[0]}.`;
  }).join('\n')}`;
}

function answerContractor(category, projects, nepali) {
  const filtered = category
    ? projects.filter((p) => p.category === category)
    : projects.filter((p) => p.contractorName);

  if (!filtered.length) {
    return nepali
      ? 'Yo category ko project vetiyena.'
      : `No projects found${category ? ` in ${category}` : ''}.`;
  }

  const withContractor = filtered.filter((p) => p.contractorName);
  if (!withContractor.length) {
    return nepali
      ? 'Contractor abhi assign vayeko chaina.'
      : 'No contractor has been assigned yet for matching projects.';
  }

  if (nepali) {
    return `${category || 'Project'} contractor record:\n${withContractor.slice(0, 6).map((p) => `• ${p.title} — ${p.contractorName} (Ward ${p.wardNo})`).join('\n')}`;
  }

  return `${category ? `${category} contractors` : 'Contractors on record'}:\n${withContractor.slice(0, 6).map((p) => `• ${p.title} — ${p.contractorName} (Ward ${p.wardNo})`).join('\n')}`;
}

function answerComplaints(projects, wardNo, nepali) {
  const all = projects.flatMap((p) =>
    (p.complaints ?? []).map((c) => ({ ...c, projectTitle: p.title, wardNo: p.wardNo })),
  );
  const filtered = wardNo ? all.filter((c) => c.wardNo === wardNo) : all;
  const open = filtered.filter((c) => c.status === 'Pending' || c.status === 'Under Review');

  if (!filtered.length) {
    return nepali ? 'Kunaipani citizen feedback record chaina.' : 'No citizen feedback has been recorded yet.';
  }

  if (nepali) {
    return `${filtered.length} wota citizen feedback, ${open.length} wota review pending:\n${filtered.slice(0, 5).map((c) => `• Ward ${c.wardNo} — ${c.projectTitle}: ${c.message.slice(0, 80)}… (${c.status})`).join('\n')}`;
  }

  return `${filtered.length} citizen feedback submission(s), ${open.length} awaiting review:\n${filtered.slice(0, 5).map((c) => `• Ward ${c.wardNo} — ${c.projectTitle}: ${c.message.slice(0, 80)}… (${c.status})`).join('\n')}`;
}

function answerGeneral(question, projects, wards, nepali) {
  if (nepali) {
    return `Ma ${PRODUCT_NAME} ko public data bata jawaf dinchu. Ward number, project type, risk, payment, contractor, ya delay bare sodhnus.\n\nUdaharan: "Ward 3 ko budget kaha kharcha bhayo?" ya "Show high risk projects in Itahari"`;
  }
  return `I answer from ${PRODUCT_NAME} public records only. Try asking about a ward budget, delayed projects, high-risk projects, contractors, or payments in Itahari.\n\nExamples: "Where did Ward 3 road budget go?" or "Which projects are delayed?"`;
}

/**
 * Answer a citizen question using local project & ward data.
 */
export function answerCitizenQuery(question, projects, wards) {
  if (!question?.trim()) {
    return 'Please type a question about ward projects or budgets.';
  }

  const nepali = isNepaliStyle(question);
  const wardNo = extractWardNumber(question);
  const category = extractCategory(question);
  const intent = matchIntent(question);

  if (!projects.length && isProjectDataIntent(intent)) {
    return NO_PUBLISHED_RECORDS_MESSAGE;
  }

  switch (intent) {
    case 'delayed':
      return answerDelayed(projects, nepali);

    case 'risk':
      if (wardNo) {
        const list = wardProjects(projects, wardNo).filter((p) => hasEnoughRiskData(p));
        const risky = list.filter((p) => getCorruptionRiskScore(p, projects) < 80);
        if (!list.length) {
          return NO_PUBLIC_PROJECTS_MESSAGE;
        }
        if (!risky.length) {
          return nepali
            ? `Ward ${wardNo} ko project haru ma ahile major risk flag chaina.`
            : `No major transparency concerns are flagged for Ward ${wardNo} projects.`;
        }
        return answerHighRisk(risky.map((p) => p), nepali);
      }
      return answerHighRisk(projects, nepali);

    case 'contractor':
      return answerContractor(category, wardNo ? wardProjects(projects, wardNo) : projects, nepali);

    case 'complaint':
      return answerComplaints(projects, wardNo, nepali);

    case 'budget':
    case 'progress':
      if (wardNo) {
        const list = wardProjects(projects, wardNo);
        if (category) {
          const catList = list.filter((p) => p.category === category);
          if (catList.length === 1) {
            const p = catList[0];
            const paid = getTotalPaid(p);
            const used = getBudgetUsedPercent(p);
            const flags = hasEnoughRiskData(p) ? detectCorruptionRisks(p, projects) : [];
            if (nepali) {
              return `Ward ${wardNo} ko ${category.toLowerCase()} project "${p.title}" ma NPR ${formatLakh(p.allocatedBudget)} budget allocate bhayeko cha. Ahile samma NPR ${formatLakh(paid)} payment bhayeko cha ra progress ${p.progressPercent}% cha.${flags.length ? ` System le yo project lai verification required vaneko cha: ${flags[0].label}.` : ''}`;
            }
            return `Ward ${wardNo}'s ${category.toLowerCase()} project "${p.title}" received ${formatCurrency(p.allocatedBudget)}. ${formatCurrency(paid)} has been paid (${used}% of budget) and progress is ${p.progressPercent}%.${flags.length ? ` One transparency concern: ${flags[0].label.toLowerCase()}.` : ''}`;
          }
        }
        return answerBudgetWard(wardNo, projects, nepali);
      }
      if (category) {
        return answerContractor(category, projects, nepali);
      }
      if (!projects.length) {
        return NO_PUBLISHED_RECORDS_MESSAGE;
      }
      return answerGeneral(question, projects, wards, nepali);

    default:
      if (wardNo) return answerBudgetWard(wardNo, projects, nepali);
      return answerGeneral(question, projects, wards, nepali);
  }
}

export const SUGGESTED_QUESTIONS = [
  'Where did ward budget go?',
  'Which projects are delayed?',
  'Who got the road contract?',
  'Show Ward 3 projects',
  'Ward budget kaha kharcha bhayo?',
];
