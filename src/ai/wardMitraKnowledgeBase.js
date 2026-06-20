const DEFINITIONS = {
  budget_transparency: {
    en: 'Budget transparency means citizens can openly see how public money is planned, approved, spent, and reported — without hidden records.',
    ne: 'Budget transparency vaneko public paisa kasari yojana, approve, kharcha ra report huncha bhannera nagarik le khule dekna paune system ho.',
  },
  good_governance: {
    en: 'Good governance means ward offices work openly, follow rules, respond to citizens, and use public funds responsibly with proof and accountability.',
    ne: 'Good governance vaneko wada office le khule kaam garne, niyam follow garne, nagarik lai jawaf dine, ra public paisa jimmevari ra proof sahit kharcha garne.',
  },
  public_procurement: {
    en: 'Public procurement is the official process of buying goods or services with government money — usually through open tender and contractor selection.',
    ne: 'Public procurement vaneko sarkari paisa bata saaman ya sewa kineko official process — aksar khule tender ra contractor chayan bata.',
  },
  tender: {
    en: 'A tender is a public notice inviting contractors to bid for a ward project. It shows who can apply, project scope, and approved budget range.',
    ne: 'Tender vaneko wada project ko lagi thekedar haru lai bid halna khule notice — kasle apply garna sakcha, project scope, ra budget range dekhauncha.',
  },
  contractor: {
    en: 'A contractor is the company or team officially selected to carry out a ward project after the tender process.',
    ne: 'Contractor vaneko tender pachhi officially chayan gareko company ya team jasle wada project implement garcha.',
  },
  ward_budget: {
    en: 'Ward budget is the amount of public money allocated to a specific ward (Wada) for local projects like roads, drainage, schools, and health posts.',
    ne: 'Ward budget vaneko kunai wada lai local project — bato, drainage, school, health post — ko lagi allocate gareko public paisa.',
  },
  citizen_complaint: {
    en: 'A citizen complaint is public feedback from a resident about a ward project — for example delay, quality concern, or missing proof. Officials review it before it affects records.',
    ne: 'Citizen complaint vaneko nagarik le project bare diyeko public feedback — delay, quality, proof missing jasto. Official le review garepachhi matra record ma bascha.',
  },
  proof_upload: {
    en: 'Proof upload means posting photos or documents that show work was actually done — before, during, or after a project — so citizens can verify progress.',
    ne: 'Proof upload vaneko kaam sachikai bhayo bhannera photo ya document upload garne — before, during, after — jaba nagarik le progress verify garna sakcha.',
  },
  risk_flag: {
    en: 'A risk flag is a transparency alert — not an accusation. It highlights when something may need verification, such as payment without public proof or a budget-progress mismatch.',
    ne: 'Risk flag vaneko transparency alert ho — arop hoina. Payment bina public proof, budget-progress mismatch jasto kura verification chahiyeko bhaye dekhauncha.',
  },
  trust_score: {
    en: 'Trust score is a 0–100 citizen-friendly rating for a project based on payments, proofs, progress, complaints, and transparency flags. Higher means fewer concerns in public records.',
    ne: 'Trust score vaneko 0–100 project rating ho — payment, proof, progress, complaint ra flag herera. Score badhi bhaye public record ma kam chinta dekhincha.',
  },
  public_accountability: {
    en: 'Public accountability means ward officials and contractors can be questioned by citizens because budget, tender, payment, and proof data are visible in one place.',
    ne: 'Public accountability vaneko budget, tender, payment ra proof data ek thau ma dekhine bhaye nagarik le ward official ra contractor lai sodhna sakne.',
  },
  qr_transparency: {
    en: 'A QR transparency board is a sign at a project site with a QR code. Citizens scan it with a phone to see live budget, payments, proof, and trust score — no app needed.',
    ne: 'QR transparency board vaneko project site ma QR code bhayeko board — phone le scan garda live budget, payment, proof ra trust score dekhincha, app chahidaina.',
  },
};

const ROMAN_NEPALI_MARKERS = /\b(ko|cha|chha|vaneko|k ho|k ho\?|bhayo|kaha|kati|kun|sabai|kharcha|hernu)\b/i;
const DEVANAGARI = /[\u0900-\u097F]/;

function prefersNepali(question) {
  return DEVANAGARI.test(question) || ROMAN_NEPALI_MARKERS.test(question);
}

export function getDefinitionAnswer(topic, question = '') {
  const entry = DEFINITIONS[topic];
  if (!entry) return null;

  if (prefersNepali(question)) {
    return entry.ne;
  }
  return entry.en;
}

export function listDefinitionTopics() {
  return Object.keys(DEFINITIONS);
}
