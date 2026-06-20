import { ITAHARI_WARD_NUMBERS } from '../constants/wards';

/** Static municipality branding — no fake budget or project counts. */
export const EMPTY_MUNICIPALITY = {
  id: 'itahari',
  name: 'Itahari Sub-Metropolitan City',
  city: 'Itahari',
  province: 'Koshi Province',
  country: 'Nepal',
  tagline: 'Transparent ward governance for Itahari citizens',
  wards: ITAHARI_WARD_NUMBERS.length,
};

export function buildEmptyWards() {
  return ITAHARI_WARD_NUMBERS.map((number) => ({
    id: `ward-${number}`,
    number,
    name: `Ward ${number}`,
  }));
}

/** Production default: empty civic records until ward admins publish data. */
export function createEmptyAppData() {
  return {
    municipality: EMPTY_MUNICIPALITY,
    wards: buildEmptyWards(),
    projects: [],
  };
}
