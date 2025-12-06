// utils/scales.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * computeNormalizationMaxs(points)
 * - Computes global extents and percentile-clipped extents for metrics.
 * - Returns an object with extents and p2/p98 values used for building robust scales.
 */
export function computeNormalizationMaxs(points) {
  const numeric = (arr) => arr.map(v => +v).filter(v => !isNaN(v));

  const populationArr = numeric(points.map(d => d.population));
  const carFreedomArr = numeric(points.map(d => d.carFreedom_raw ?? d.carFreedom ?? 0));
  const educationArr = numeric(points.map(d => d.bachelors_pct ?? d.education_raw ?? d.education ?? 0));
  const rentArr = numeric(points.map(d => d.median_rent ?? NaN));
  const mortgageArr = numeric(points.map(d => d.median_mortgage_burden ?? NaN));
  const unemploymentArr = numeric(points.map(d => d.unemployment ?? NaN));

  const stats = (arr) => {
    if (!arr.length) return { min: 0, max: 1, p2: 0, p98: 1, median: 0 };
    arr.sort((a,b) => a-b);
    const min = arr[0], max = arr[arr.length-1];
    const p2 = d3.quantile(arr, 0.02);
    const p98 = d3.quantile(arr, 0.98);
    const median = d3.quantile(arr, 0.5);
    return { min, max, p2: (p2==null?min:p2), p98: (p98==null?max:p98), median };
  };

  return {
    population: stats(populationArr),
    carFreedom: stats(carFreedomArr),
    education: stats(educationArr),
    rent: stats(rentArr),
    mortgage: stats(mortgageArr),
    unemployment: stats(unemploymentArr)
  };
}


/**
 * buildRadiusScale(globalNorms, metric, rMin=3, rMax=20)
 *
 * - globalNorms: return value of computeNormalizationMaxs(allPoints)
 * - metric: string — property name on each point (e.g., 'population', 'education', 'median_rent', etc.)
 * - returns a scale function that is stable and perceptually meaningful.
 *
 * Behavior decisions:
 * - population: sqrt scale on percentile-clipped domain (p2..p98), uses global domain (stable).
 * - normalized metrics (carFreedom, education, affordability, opportunity): use power scale (exponent 0.6)
 *   on [0,1] to expand mid-values and provide more variance.
 * - skewed positive numeric metrics (income, rent): use log scale if strongly skewed, else sqrt.
 * - domain is clipped to p2..p98 to reduce outlier influence; scale is clamped.
 */
export function buildRadiusScale(globalNorms, metric = 'population', rMin = 3, rMax = 20) {
  // helpers
  const normalizedMetrics = new Set(['carFreedom','education','affordability','opportunity']);
  // find stats from globalNorms
  const g = globalNorms;

  // Population special case (use percentile clipping for robustness)
  if (metric === 'population') {
    const domainMin = Math.max(1, g.population.p2);
    const domainMax = Math.max(domainMin + 1, g.population.p98);
    return d3.scaleSqrt().domain([domainMin, domainMax]).range([rMin, rMax]).clamp(true);
  }

  // Normalized canonical metrics (0..1)
  if (normalizedMetrics.has(metric)) {
    // ensure domain 0..1, use pow scale to increase mid-range spread
    // exponent <1 amplifies differences for low-mid values visually
    return d3.scalePow().exponent(0.6).domain([0,1]).range([rMin, rMax]).clamp(true);
  }

  // Otherwise inspect global norms for metric name matches
  // map a few common metric names to stats
  if (metric === 'median_rent' || metric === 'median_income') {
    const stat = (metric === 'median_rent') ? g.rent : (metric === 'median_income' ? g.income : null);
    // stats may be undefined; fallback to generic approach
    const p2 = (stat && stat.p2) ? stat.p2 : 1;
    const p98 = (stat && stat.p98) ? stat.p98 : Math.max(p2+1, 1000);
    // If skewed (p98/p2 large), use log scale; otherwise sqrt
    if (p2 > 0 && p98 / Math.max(1,p2) > 100) {
      return d3.scaleLog().domain([Math.max(1,p2), p98]).range([rMin, rMax]).clamp(true);
    } else {
      return d3.scaleSqrt().domain([p2, p98]).range([rMin, rMax]).clamp(true);
    }
  }

  // Generic numeric fallback: find stat in globalNorms if exists
  const metricKeyMap = {
    median_rent: g.rent,
    median_mortgage_burden: g.mortgage,
    unemployment: g.unemployment
  };

  const stat = metricKeyMap[metric];
  if (stat) {
    const p2 = stat.p2, p98 = stat.p98;
    if (p2 > 0 && p98 / Math.max(1, p2) > 100) {
      return d3.scaleLog().domain([Math.max(1,p2), p98]).range([rMin, rMax]).clamp(true);
    } else {
      return d3.scaleSqrt().domain([p2, p98]).range([rMin, rMax]).clamp(true);
    }
  }

  // Final fallback: compute domain 0..1 (for normalized-ish) or 1..100
  return d3.scaleSqrt().domain([0,1]).range([rMin, rMax]).clamp(true);
}


/**
 * makeMonoColorScale(baseHex, valuesArrayOrDomain, opts)
 *
 * - baseHex: base color hex string (e.g., "#4e79a7")
 * - valuesArrayOrDomain: either an array of numeric values (preferred) or a 2-length domain [min,max].
 * - opts: { percentiles: [pLow, pHigh] } - if values array given, we clip to these percentiles (default [0.02,0.98])
 *
 * Returns a d3 scale that maps numeric -> hex color (light -> base)
 * Uses d3.interpolateLab for perceptual interpolation and clamps to domain.
 */
export function makeMonoColorScale(baseHex, valuesArrayOrDomain, opts = {}) {
  const percentiles = opts.percentiles ?? [0.02, 0.98];
  let domain = null;

  if (Array.isArray(valuesArrayOrDomain)) {
    const arr = valuesArrayOrDomain.map(v => +v).filter(v => !isNaN(v));
    if (!arr.length) {
      domain = [0,1];
    } else {
      arr.sort((a,b) => a-b);
      const pLow = d3.quantile(arr, percentiles[0]) ?? arr[0];
      const pHigh = d3.quantile(arr, percentiles[1]) ?? arr[arr.length - 1];
      // safety if pLow == pHigh
      domain = [pLow, Math.max(pHigh, pLow + 1e-6)];
    }
  } else if (Array.isArray(valuesArrayOrDomain) && valuesArrayOrDomain.length === 2) {
    domain = valuesArrayOrDomain;
  } else if (valuesArrayOrDomain && typeof valuesArrayOrDomain === "object" && valuesArrayOrDomain.p2 !== undefined) {
    // Accept a stats object from computeNormalizationMaxs: use p2..p98
    domain = [valuesArrayOrDomain.p2, valuesArrayOrDomain.p98];
  } else {
    // fallback
    domain = [0,1];
  }

  const base = d3.color(baseHex) || d3.color("#777");
  const light = d3.color(base).brighter(1.8).formatHex ? d3.color(base).brighter(1.8).formatHex() : d3.color(base).brighter(1.8).toString();
  const dark  = d3.color(base).darker(0.6).formatHex ? d3.color(base).darker(0.6).formatHex() : d3.color(base).darker(0.6).toString();

  return d3.scaleLinear()
    .domain(domain)
    .range([light, dark])
    .interpolate(d3.interpolateLab)
    .clamp(true);
}
