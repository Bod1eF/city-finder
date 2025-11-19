export function parseFeatureProps(feature) {
  const p = feature.properties || {};

  // helper
  const toNum = v => {
    if (v === undefined || v === null || v === "") return 0;
    const n = +v;
    return Number.isFinite(n) ? n : 0;
  };

  const pop = toNum(p.population || p.POPULATION || p.population_estimate);
  const transit = toNum(p.transit_percent || p.transit);
  const bike = toNum(p.bike_percent || p.bike);
  const walk = toNum(p.walk_percent || p.walk);
  const car = toNum(p.car_percent || p.car);
  const wfh = toNum(p.wfh_percent || p.wfh);
  const bachelors_pct = toNum(p.bachelors_plus_percent || p.bachelors_percent || p.bachelors);
  const median_rent = toNum(p.median_rent || p.MEDIAN_RENT);
  const median_mortgage_burden = toNum(p.median_mortgage_burden || p.median_mortgage);
  const unemployment = toNum(p.unemployment_rate || p.unemployment || p.unemployed_rate);

  // education counts (B15003 derived) - keep friendly names
  const edu_total = toNum(p.education_total || p.B15003_001E);
  const edu_no_school = toNum(p.no_schooling || p.B15003_002E);
  const edu_12_no = toNum(p.grade_12_no_diploma || p.B15003_016E);
  const edu_hs = toNum(p.high_school_diploma || p.B15003_017E);
  const edu_ged = toNum(p.ged_or_alternative || p.B15003_018E);
  const edu_some_college_less = toNum(p.some_college_less_1_year || p.B15003_019E);
  const edu_some_college_more = toNum(p.some_college_1_or_more_years || p.B15003_020E);
  const edu_assoc = toNum(p.associates_degree || p.B15003_021E);
  const edu_bach = toNum(p.bachelors_degree || p.B15003_022E);
  const edu_masters = toNum(p.masters_degree || p.B15003_023E);
  const edu_prof = toNum(p.professional_degree || p.B15003_024E);
  const edu_doc = toNum(p.doctorate_degree || p.B15003_025E);

  // rent and mortgage bins
  const rent_total = toNum(p.total_rent_burden || p.B25070_001E);
  const rent_bins = [
    toNum(p.rent_burden_less_10 || p.B25070_002E),
    toNum(p.rent_burden_less_15 || p.B25070_003E),
    toNum(p.rent_burden_less_20 || p.B25070_004E),
    toNum(p.rent_burden_less_25 || p.B25070_005E),
    toNum(p.rent_burden_less_30 || p.B25070_006E),
    toNum(p.rent_burden_less_35 || p.B25070_007E),
    toNum(p.rent_burden_less_40 || p.B25070_008E),
    toNum(p.rent_burden_less_50 || p.B25070_009E),
    toNum(p.rent_burden_over_50 || p.B25070_010E)
  ];

  const mortgage_total = toNum(p.mortgage_total || p.B25091_002E);
  const mortgage_bins = [
    toNum(p.mortgage_less_10 || p.B25091_003E),
    toNum(p.mortgage_10_15 || p.B25091_004E),
    toNum(p.mortgage_15_20 || p.B25091_005E),
    toNum(p.mortgage_20_25 || p.B25091_006E),
    toNum(p.mortgage_25_30 || p.B25091_007E),
    toNum(p.mortgage_30_35 || p.B25091_008E),
    toNum(p.mortgage_35_40 || p.B25091_009E),
    toNum(p.mortgage_40_50 || p.B25091_010E),
    toNum(p.mortgage_over_50 || p.B25091_011E)
  ];

  const carFreedom = transit + bike + walk + wfh;

  return {
    // core
    feature,
    population: pop,
    transit, bike, walk, car, wfh,
    carFreedom,
    bachelors_pct,
    median_rent,
    median_mortgage_burden,
    unemployment,
    // edu counts
    edu_total, edu_no_school, edu_12_no, edu_hs, edu_ged, edu_some_college_less, edu_some_college_more, edu_assoc, edu_bach, edu_masters, edu_prof, edu_doc,
    // burden bins
    rent_total, rent_bins,
    mortgage_total, mortgage_bins
  };
}
