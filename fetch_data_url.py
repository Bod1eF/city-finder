summary = {
    "population": "B01003_001E",
    "median_income": "B19013_001E",
    "median_rent": "B25064_001E",
    "median_age": "B01002_001E",
}

rent_burden= {
    "total_rent_burden": "B25070_001E",
    "rent_burden_less_10": "B25070_002E",
    "rent_burden_less_15": "B25070_003E",
    "rent_burden_less_20": "B25070_004E",
    "rent_burden_less_25": "B25070_005E",
    "rent_burden_less_30": "B25070_006E",
    "rent_burden_less_35": "B25070_007E",
    "rent_burden_less_40": "B25070_008E",
    "rent_burden_less_50": "B25070_009E",
    "rent_burden_over_50": "B25070_010E",
    "median_rent_burden": "B25071_001E",
}

mortgage_burden = {
    "mortgage_total": "B25091_002E",
    "mortgage_less_10": "B25091_003E",
    "mortgage_10_15": "B25091_004E",
    "mortgage_15_20": "B25091_005E",
    "mortgage_20_25": "B25091_006E",
    "mortgage_25_30": "B25091_007E",
    "mortgage_30_35": "B25091_008E",
    "mortgage_35_40": "B25091_009E",
    "mortgage_40_50": "B25091_010E",
    "mortgage_over_50": "B25091_011E",
    "median_mortgage_burden": "B25092_002E",
}

employment = {
  "labor_force_total": "B23025_001E",
  "total_unemployed": "B23025_005E",
}
#calculated fields: 
# unemployment rate ( "total_unemployed"/"labor_force_total" * 100)

education = {
    "education_total": "B15003_001E",
    "no_schooling": "B15003_002E",
    "nursery_school": "B15003_003E",
    "kindergarten": "B15003_004E",
    "grade_1": "B15003_005E",
    "grade_2": "B15003_006E",
    "grade_3": "B15003_007E",
    "grade_4": "B15003_008E",
    "grade_5": "B15003_009E",
    "grade_6": "B15003_010E",
    "grade_7": "B15003_011E",
    "grade_8": "B15003_012E",
    "grade_9": "B15003_013E",
    "grade_10": "B15003_014E",
    "grade_11": "B15003_015E",
    "grade_12_no_diploma": "B15003_016E",
    "high_school_diploma": "B15003_017E",
    "ged_or_alternative": "B15003_018E",
    "some_college_less_1_year": "B15003_019E",
    "some_college_1_or_more_years": "B15003_020E",
    "associates_degree": "B15003_021E",
    "bachelors_degree": "B15003_022E",
    "masters_degree": "B15003_023E",
    "professional_degree": "B15003_024E",
    "doctorate_degree": "B15003_025E",
}
#calculated fields: 
# bachelor+ percentage
# education bins: 
# 1. less than highschool (12 no diploma and below)
# 2. completed highschool (higschool diploma + ged or alternative)
# 3. some college ("some_college_less_1_year")

demographics = {
    "white": "B02001_002E",
    "black": "B02001_003E",
    "native": "B02001_004E",
    "asian": "B02001_005E",
    "pacific": "B02001_006E",
    "other": "B02001_007E",
    "two_plus": "B02001_008E",
}

base_url = "https://api.census.gov/data/2023/acs/acs5"

codes = ",".join(summary.values())

url = f"{base_url}?get=NAME,{codes}&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:*"

print(url)
