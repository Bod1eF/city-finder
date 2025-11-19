  export function normalizedMetrics(p, tenure, normalizationMaxs) {
    const {maxCarFreedom, maxEducation, rentExtent, mortgageExtent, unemploymentExtent} = normalizationMaxs;
    const carFreedomNorm = (p.carFreedom || 0) / (maxCarFreedom || 1);
    const educationNorm = (p.bachelors_pct || 0) / (maxEducation || 1);

    let affRaw = (tenure === "buy") ? (p.median_mortgage_burden || 0) : (p.median_rent || 0);
    let minA = (tenure === "buy") ? (mortgageExtent[0] || 0) : (rentExtent[0] || 0);
    let maxA = (tenure === "buy") ? (mortgageExtent[1] || (minA + 1)) : (rentExtent[1] || (minA + 1));
    let affNorm = 1 - ((affRaw - minA) / (maxA - minA));
    affNorm = Math.max(0, Math.min(1, affNorm || 0));

    const minU = unemploymentExtent[0] || 0;
    const maxU = unemploymentExtent[1] || (minU + 1);
    let oppNorm = 1 - (((p.unemployment || 0) - minU) / (maxU - minU));
    oppNorm = Math.max(0, Math.min(1, oppNorm || 0));

    return {
      carFreedom: Math.max(0, Math.min(1, carFreedomNorm || 0)),
      education: Math.max(0, Math.min(1, educationNorm || 0)),
      affordability: affNorm,
      opportunity: oppNorm
    };
  }