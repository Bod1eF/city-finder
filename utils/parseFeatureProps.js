import { toNum } from './computeNormalizationMaxsFromFeatures.js';


export function parseFeatureProps(feature, normalizationMaxs = null, tenure = 'rent') {
  const p = feature.properties || {};
  const n = v => toNum(v);

  const population = n(p.population);
  const transit = n(p.transit_percent);
  const bike = n(p.bachelors ? 0 : p.bike_percent ?? p.bike);
  const walk = n(p.walk_percent);
  const car = n(p.car_percent);
  const wfh = n(p.wfh_percent);
  const bachelors_pct = n(p.bachelors_plus_percent);

  const median_rent = n(p.median_rent);
  const median_rent_burden = n(p.median_rent_burden);
  const median_mortgage_burden = n(p.median_mortgage_burden);

  const labor_force_total = n(p.labor_force_total);
  const total_unemployed = n(p.total_unemployed);
  const unemployment = (labor_force_total > 0) ? (total_unemployed / labor_force_total * 100) : n(p.unemployment_rate ?? p.unemployed_rate);

  const edu_total = toNum(p.education_total);
  const edu_no_school = toNum(p.no_schooling);
  const edu_12_no = toNum(p.grade_12_no_diploma);
  const edu_hs = toNum(p.high_school_diploma);
  const edu_ged = toNum(p.ged_or_alternative);
  const edu_some_college_less = toNum(p.some_college_less_1_year);
  const edu_some_college_more = toNum(p.some_college_1_or_more_years);
  const edu_assoc = toNum(p.associates_degree);
  const edu_bach = toNum(p.bachelors_degree);
  const edu_masters = toNum(p.masters_degree);
  const edu_prof = toNum(p.professional_degreeE);
  const edu_doc = toNum(p.doctorate_degree);

  const mortgage_less_10 = n(p.mortgage_less_10);
  const mortgage_10_15 = n(p.mortgage_10_15);
  const mortgage_15_20 = n(p.mortgage_15_20);
  const mortgage_20_25 = n(p.mortgage_20_25);
  const mortgage_25_30 = n(p.mortgage_25_30);
  const mortgage_30_35 = n(p.mortgage_30_35);
  const mortgage_35_40 = n(p.mortgage_35_40);
  const mortgage_40_50 = n(p.mortgage_40_50);
  const mortgage_over_50 = n(p.mortgage_over_50);

  const mortgage_bins = [
    mortgage_less_10, mortgage_10_15, mortgage_15_20,
    mortgage_20_25, mortgage_25_30, mortgage_30_35,
    mortgage_35_40, mortgage_40_50, mortgage_over_50
  ];

  const mortgage_total = n(p.mortgage_total) || mortgage_bins.reduce((s, x) => s + x, 0);

  const rent_bins = Array.isArray(p.rent_bins) ? p.rent_bins.map(x => n(x)) : ([
    n(p.rent_burden_less_10),
    n(p.rent_burden_less_15),
    n(p.rent_burden_less_20),
    n(p.rent_burden_less_25),
    n(p.rent_burden_less_30),
    n(p.rent_burden_less_35),
    n(p.rent_burden_less_40),
    n(p.rent_burden_less_50),
    n(p.rent_burden_over_50)
  ]);

  const rent_total = n(p.rent_total) || rent_bins.reduce((s, x) => s + x, 0);

  const carFreedom_raw = transit + bike + walk + wfh; // in percent points (0..100)
  const education_raw = bachelors_pct; // percent (0..100)
  const affordability_raw = (tenure === 'buy') ? median_mortgage_burden : median_rent; // either % (mortgage burden) or $ (rent)
  const opportunity_raw = unemployment; // percent

  const nm = normalizationMaxs || {
    maxCarFreedom: 100,
    maxEducation: 100,
    rentExtent: [0, 3000],
    mortgageExtent: [0, mortgage_total || 1],
    unemploymentExtent: [0, 30]
  };

  const maxCarFreedom = nm.maxCarFreedom ?? 100;
  const maxEducation = nm.maxEducation ?? 100;
  const rentExtent = nm.rentExtent ?? [0, 3000];
  const mortgageExtent = nm.mortgageExtent ?? [0, mortgage_total || 1];
  const unemploymentExtent = nm.unemploymentExtent ?? [0, 30];

  const clamp01 = v => Math.max(0, Math.min(1, (v === undefined || v === null || Number.isNaN(v)) ? 0 : v));

  const carFreedom = clamp01(carFreedom_raw / (maxCarFreedom || 1));
  const education = clamp01(education_raw / (maxEducation || 1));

  let affRaw = affordability_raw;
  let minA, maxA;
  if (tenure === 'buy') {
    minA = mortgageExtent[0]; maxA = mortgageExtent[1];
  } else {
    minA = rentExtent[0]; maxA = rentExtent[1];
  }
  if (maxA === minA) maxA = minA + 1;
  let affordability = 1 - ((affRaw - minA) / (maxA - minA));
  affordability = clamp01(affordability);

  const minU = unemploymentExtent[0]; const maxU = unemploymentExtent[1];
  let opportunity = 1 - ((opportunity_raw - minU) / (maxU - minU));
  opportunity = clamp01(opportunity);

  return {
    feature,
    population,
    transit, bike, walk, car, wfh,
    edu_total, edu_no_school, edu_12_no, edu_hs, edu_ged, edu_some_college_less, edu_some_college_more, edu_assoc, edu_bach, edu_masters, edu_prof, edu_doc,
    median_rent,
    median_rent_burden,
    median_mortgage_burden,
    rent_total,
    rent_bins,
    mortgage_total,
    mortgage_bins,
    labor_force_total,
    total_unemployed,
    unemployment,
    carFreedom_raw,
    education_raw,
    affordability_raw,
    opportunity_raw,
    carFreedom,
    education,
    affordability,
    opportunity      
  };
}
