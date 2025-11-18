import pandas as pd
import geopandas as gpd

# ----------------------------------------------
# 1. Load your commute CSV
# ----------------------------------------------
csv_path = "commute_mode.csv"  # rename to your actual file
df = pd.read_csv(csv_path)

# Clean column name for merge
df["CBSAFP"] = df["metropolitan statistical area/micropolitan statistical area"].astype(str).str.zfill(5)

# ----------------------------------------------
# 2. Load the CBSA shapefile
# ----------------------------------------------
shp_path = "cbsa_shp/cb_2023_us_cbsa_500k.shp"  # adjust path if needed
cbsa = gpd.read_file(shp_path)

# GEOID field in the shapefile is CBSAFP
cbsa["CBSAFP"] = cbsa["CBSAFP"].astype(str).str.zfill(5)

# ----------------------------------------------
# 3. Merge commute data with geometry
# ----------------------------------------------
merged = cbsa.merge(df, on="CBSAFP", how="inner")

print("Merged rows:", len(merged))

# ----------------------------------------------
# 4. Export GeoJSON for D3
# ----------------------------------------------
merged.to_file("cbsa_commute.geojson", driver="GeoJSON")

print("GeoJSON created: cbsa_commute.geojson")
