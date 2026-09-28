/**
 * A coarse world map for the regions scene: land as 5° cells, and the countries
 * served as points on it.
 *
 * Hand-drawn at 5° from reference geography, equirectangular, lat 80°N to 55°S
 * (Antarctica left out — nobody is served there). It is a silhouette, not a
 * survey: close enough that each continent reads, never used to state a fact.
 * The countries themselves are named in the DOM (rule 4).
 *
 * Row r covers lat (80 − 5r) → (75 − 5r). Column c covers lon (−180 + 5c) →
 * (−175 + 5c). Each row lists inclusive column ranges that are land.
 */
const LAND: Array<Array<[number, number]>> = [
  /* 80–75 */ [[12, 20], [22, 31], [39, 40], [55, 57]],
  /* 75–70 */ [[3, 7], [11, 21], [24, 31], [47, 47], [50, 71]],
  /* 70–65 */ [[3, 7], [8, 22], [25, 30], [39, 71]],
  /* 65–60 */ [[3, 7], [8, 16], [20, 23], [26, 27], [31, 32], [37, 71]],
  /* 60–55 */ [[10, 16], [20, 23], [34, 35], [37, 39], [40, 63], [67, 68]],
  /* 55–50 */ [[10, 23], [34, 35], [36, 43], [44, 63], [67, 67]],
  /* 50–45 */ [[11, 23], [35, 36], [37, 41], [43, 44], [47, 62], [64, 64]],
  /* 45–40 */ [[11, 22], [34, 36], [37, 41], [44, 45], [47, 60], [61, 61], [64, 64]],
  /* 40–35 */ [[11, 21], [34, 35], [39, 40], [41, 44], [45, 47], [48, 59], [61, 61], [62, 64]],
  /* 35–30 */ [[12, 19], [34, 42], [43, 45], [46, 47], [48, 60], [62, 62]],
  /* 30–25 */ [[13, 16], [19, 19], [33, 42], [43, 47], [47, 49], [50, 60]],
  /* 25–20 */ [[14, 16], [19, 20], [33, 43], [44, 47], [50, 54], [55, 57]],
  /* 20–15 */ [[15, 18], [33, 43], [44, 46], [51, 53], [55, 57], [60, 60]],
  /* 15–10 */ [[17, 19], [33, 46], [51, 51], [55, 57], [60, 60]],
  /* 10–5 */ [[20, 23], [33, 45], [52, 52], [56, 56], [60, 60]],
  /* 5–0 */ [[20, 26], [37, 44], [55, 56], [57, 59], [60, 60]],
  /* 0–−5 */ [[20, 29], [37, 43], [56, 56], [58, 59], [60, 60], [62, 65]],
  /* −5–−10 */ [[20, 29], [38, 43], [57, 58], [64, 65]],
  /* −10–−15 */ [[21, 28], [38, 43], [45, 45], [62, 64]],
  /* −15–−20 */ [[21, 27], [38, 43], [45, 45], [60, 65]],
  /* −20–−25 */ [[22, 27], [38, 42], [45, 45], [58, 66]],
  /* −25–−30 */ [[21, 26], [39, 42], [58, 66]],
  /* −30–−35 */ [[21, 25], [39, 41], [59, 60], [62, 66]],
  /* −35–−40 */ [[21, 24], [64, 65], [70, 70]],
  /* −40–−45 */ [[21, 23], [65, 65], [70, 70]],
  /* −45–−50 */ [[21, 22], [69, 69]],
  /* −50–−55 */ [[21, 22]],
];

export const MAP_COLS = 72;
export const MAP_ROWS = LAND.length;
/** World units per 5° cell. The map is MAP_COLS × MAP_ROWS cells. */
export const CELL = 0.14;

/** Land cell centres in map space: x east, z south, origin at the map's centre. */
export const LAND_CELLS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  LAND.forEach((ranges, r) => {
    for (const [a, b] of ranges) {
      for (let c = a; c <= b; c += 1) {
        out.push([(c + 0.5 - MAP_COLS / 2) * CELL, (r + 0.5 - MAP_ROWS / 2) * CELL]);
      }
    }
  });
  return out;
})();

const TOP_LAT = 80;

/** Latitude/longitude → map space, on the same grid as LAND_CELLS. */
export function project(lat: number, lon: number): [number, number] {
  const x = ((lon + 180) / 5 - MAP_COLS / 2) * CELL;
  const z = ((TOP_LAT - lat) / 5 - MAP_ROWS / 2) * CELL;
  return [x, z];
}

/**
 * Marker colour, only where rotating hues by list order would put the same
 * colour on neighbours (Malaysia and Singapore would both land on plum).
 */
export const COUNTRY_HUE: Record<string, 'blueprint' | 'pine' | 'ochre' | 'plum' | 'rose'> = {
  Malaysia: 'blueprint',
};

/**
 * Where each country's marker stands. Geography, not business data. A point
 * inside the country, near where the work is: the capital or main commercial
 * centre. Malaysia sits on the peninsula north of Kuala Lumpur, so it does not
 * touch Singapore's marker at this scale.
 */
export const COUNTRY_POINTS: Record<string, [number, number]> = {
  India: [21, 78],
  USA: [39, -98],
  UK: [52.5, -1.5],
  Singapore: [1.35, 103.8],
  Thailand: [15, 101],
  Australia: [-25, 134],
  Netherlands: [52.3, 5.3],
  UAE: [24.4, 54.4],
  Malaysia: [5, 101.5],
  'Saudi Arabia': [24, 45],
  'Czech Republic': [49.8, 15.5],
};
