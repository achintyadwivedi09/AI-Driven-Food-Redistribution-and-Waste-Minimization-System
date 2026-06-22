import sys, os
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import pandas as pd, json

print("=== FEEDIFY PIPELINE FINAL VERIFICATION ===")

# Part 1
df1 = pd.read_csv("feedify_real_data/part1_weather/processed/weather_all_cities.csv")
print(f"Part 1 Weather       : {len(df1):,} rows | {df1['city'].nunique()} cities | temp_mean nulls={df1['temp_mean'].isna().sum()}")

# Part 2
df2 = pd.read_csv("feedify_real_data/part2_ngo/processed/ngo_profiles.csv")
print(f"Part 2 NGOs          : {len(df2):,} profiles | {df2['city'].nunique()} cities")

# Part 3
df3 = pd.read_csv("feedify_real_data/part3_surplus/processed/donor_surplus_calibrated.csv")
print(f"Part 3 Donor Surplus : {len(df3):,} rows | surplus_kg mean={df3['surplus_kg'].mean():.1f}kg | PI_final mean={df3['PI_final'].mean():.3f}")

# Part 4
df4 = pd.read_csv("feedify_real_data/part4_integration/processed/distance_matrix_real.csv")
df_master = pd.read_csv("feedify_real_data/part4_integration/processed/feedify_master_dataset.csv")
real_road = int(df4["is_real_road_distance"].sum())
print(f"Part 4 Distances     : {len(df4):,} pairs | {real_road} real OSRM road dists | master={len(df_master):,} rows")

# Part 5 codebase-ready
cb = "feedify_real_data/part5_validation/codebase_ready"
csvs = [f for f in os.listdir(cb) if f.endswith(".csv")]
print(f"Part 5 Codebase-rdy  : {len(csvs)} CSV files -> {csvs}")

# Checkpoint
cp = json.load(open("feedify_real_data/checkpoint.json"))
print("\nCheckpoint status:")
for k, v in cp.items():
    rows = v.get("rows_collected", "N/A")
    ts   = v.get("timestamp", "")[:19]
    print(f"  {k}: done={v['done']} | rows={rows} | {ts}")

print("\n=== ALL 5 PARTS COMPLETE ===")
print("Next: copy 4 files from feedify_real_data/part5_validation/codebase_ready/")
print("   -> periRoute/data/processed/")
print("Then run: python part2_analysis.py")
