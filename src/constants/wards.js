/** Itahari demo municipality — wards 1 through 5 only. */
export const ITAHARI_WARD_NUMBERS = [1, 2, 3, 4, 5];

export function formatWardLabel(wardNo) {
  const n = Number(wardNo);
  if (!Number.isFinite(n) || n < 1) return '';
  return `Ward ${n}`;
}

export function normalizeWardNo(value) {
  const n = Number(value);
  return Number.isFinite(n) && ITAHARI_WARD_NUMBERS.includes(n) ? n : null;
}

/** Ensure ward records always use simple display names. */
export function normalizeWardRecord(ward) {
  if (!ward) return ward;
  return {
    ...ward,
    name: formatWardLabel(ward.number),
  };
}

export function normalizeWardList(wards = []) {
  return wards.map(normalizeWardRecord);
}
