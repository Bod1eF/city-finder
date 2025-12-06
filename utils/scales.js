export function computeNormalizationMaxs(points) {
  return {
    maxCarFreedom: d3.max(points, d => d.carFreedom) || 100,
    maxEducation: d3.max(points, d => d.bachelors_pct) || 100,
    rentExtent: d3.extent(points, d => d.median_rent),
    mortgageExtent: d3.extent(points, d => d.median_mortgage_burden),
    unemploymentExtent: d3.extent(points, d => d.unemployment)
  };
}

export function buildRadiusScale(points, metric = 'population', rMin = 3, rMax = 20) {
  const vals = points.map(d => +d[metric]).filter(v => !isNaN(v));
  const vMin = d3.min(vals) ?? 0;
  const vMax = d3.max(vals) ?? 1;

  if (vMin === vMax) {
    return () => (rMin + rMax) / 2;
  }
  if (vMax <= 1 && vMin >= 0) {
    return d3.scaleSqrt().domain([0, 1]).range([rMin, rMax]);
  }
  return d3.scaleSqrt().domain([vMin, vMax]).range([rMin, rMax]);
}


export function makeMonoColorScale(baseHex, domain, lighterFactor = 1.6, darkerFactor = 1.1) {
  const base = d3.color(baseHex) || d3.color("#777");

  const light = d3.color(base).brighter(lighterFactor).formatHex ? d3.color(base).brighter(lighterFactor).formatHex() : d3.color(base).brighter(lighterFactor).toString();
  const dark  = d3.color(base).darker(darkerFactor).formatHex ? d3.color(base).darker(darkerFactor).formatHex() : d3.color(base).darker(darkerFactor).toString();

  return d3.scaleLinear().domain(domain).range([light, dark]).interpolate(d3.interpolateLab);
}