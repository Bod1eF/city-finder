export function toNum(v) {
  if (v === undefined || v === null || v === "") return 0;
  const n = +v;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Scan raw GeoJSON features to compute maxima / extents needed for normalization.
 * Expects the raw source properties to have keys like:
 *  - population
 *  - transit_percent, bike_percent, walk_percent, car_percent, wfh_percent
 *  - bachelors_percent (or bachelors)
 *  - median_rent
 *  - median_mortgage_burden
 *  - unemployment_rate
 */
export function computeNormalizationMaxsFromFeatures(features) {
  let maxCarFreedom = 0;
  let maxEducation = 0;
  const rentVals = [];
  const mortgageVals = [];
  const unemploymentVals = [];

  for (const feat of features) {
    const p = feat.properties || {};

    const transit = toNum(p.transit_percent ?? p.transit);
    const bike = toNum(p.bike_percent ?? p.bike);
    const walk = toNum(p.walk_percent ?? p.walk);
    const wfh = toNum(p.wfh_percent ?? p.wfh);
    const bachelors = toNum(p.bachelors_percent ?? p.bachelors ?? p.bachelors_plus_percent ?? p.bachelors_pct);
    const median_rent = toNum(p.median_rent ?? p.MEDIAN_RENT ?? p.medianRent);
    const median_mortgage_burden = toNum(p.median_mortgage_burden ?? p.median_mortgage_burden ?? p.median_mortgage);
    const unemployment = toNum(p.unemployment_rate ?? p.unemployment ?? p.unemployed_rate);

    const carFreedomRaw = transit + bike + walk + wfh;
    if (carFreedomRaw > maxCarFreedom) maxCarFreedom = carFreedomRaw;
    if (bachelors > maxEducation) maxEducation = bachelors;

    if (!Number.isNaN(median_rent) && median_rent !== 0) rentVals.push(median_rent);
    if (!Number.isNaN(median_mortgage_burden) && median_mortgage_burden !== 0) mortgageVals.push(median_mortgage_burden);
    if (!Number.isNaN(unemployment)) unemploymentVals.push(unemployment);
  }

  // Compute extents
  const rentExtent = (rentVals.length > 0) ? [Math.min(...rentVals), Math.max(...rentVals)] : [0, 3000];
  const mortgageExtent = (mortgageVals.length > 0) ? [Math.min(...mortgageVals), Math.max(...mortgageVals)] : [0, 1];
  const unemploymentExtent = (unemploymentVals.length > 0) ? [Math.min(...unemploymentVals), Math.max(...unemploymentVals)] : [0, 30];

  // Safety: avoid zero maxes
  if (maxCarFreedom <= 0) maxCarFreedom = 100;   // percentages sum, safe default
  if (maxEducation <= 0) maxEducation = 100;     // percent
  if (rentExtent[0] === rentExtent[1]) rentExtent[1] = rentExtent[0] + 1;
  if (mortgageExtent[0] === mortgageExtent[1]) mortgageExtent[1] = mortgageExtent[0] + 1;
  if (unemploymentExtent[0] === unemploymentExtent[1]) unemploymentExtent[1] = unemploymentExtent[0] + 1;

  return {
    maxCarFreedom,
    maxEducation,
    rentExtent,
    mortgageExtent,
    unemploymentExtent
  };
}
