import pandas as pd
import geopandas as gpd

commute_path = "commute_mode.csv"
census_path  = "merged_msa.csv"

df_commute = pd.read_csv(commute_path)
df_census  = pd.read_csv(census_path)

df_commute["CBSAFP"] = (
    df_commute["metropolitan statistical area/micropolitan statistical area"]
    .astype(str).str.zfill(5)
)

df_census["CBSAFP"] = (
    df_census["metropolitan statistical area/micropolitan statistical area"]
    .astype(str).str.zfill(5)
)

merged_csv = df_commute.merge(df_census, on="CBSAFP", how="inner")

print("Rows after merging commute + census:", len(merged_csv))

merged_csv_path = "commute_plus_census.csv"
merged_csv.to_csv(merged_csv_path, index=False)
print("Saved:", merged_csv_path)

cbsa_shp = "cbsa_shp/cb_2023_us_cbsa_500k.shp"
cbsa = gpd.read_file(cbsa_shp)

cbsa["CBSAFP"] = cbsa["CBSAFP"].astype(str).str.zfill(5)

final_geo = cbsa.merge(merged_csv, on="CBSAFP", how="inner")

print("Final rows with geometry:", len(final_geo))

final_geo.to_file("cbsa_final.geojson", driver="GeoJSON")
print("Created GeoJSON: cbsa_final.geojson")
