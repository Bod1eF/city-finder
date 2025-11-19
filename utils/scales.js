export function buildRadiusScale(points, range = [3, 22]) {
  const popExtent = d3.extent(points, d => d.population);
  const minPop = Math.max(1, popExtent[0] || 1);
  const maxPop = Math.max(2, popExtent[1] || 2);
  return d3.scaleSqrt().domain([minPop, maxPop]).range(range);
}

export function computeNormalizationMaxs(points) {
  return {
    maxCarFreedom: d3.max(points, d => d.carFreedom) || 100,
    maxEducation: d3.max(points, d => d.bachelors_pct) || 100,
    rentExtent: d3.extent(points, d => d.median_rent),
    mortgageExtent: d3.extent(points, d => d.median_mortgage_burden),
    unemploymentExtent: d3.extent(points, d => d.unemployment)
  };
}
