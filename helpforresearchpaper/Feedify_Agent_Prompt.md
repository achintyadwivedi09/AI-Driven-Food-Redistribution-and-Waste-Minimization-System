FEEDIFY

Real Data Acquisition — AI Agent Prompt

5-Part Resumable Pipeline

────────────────────────────────────────────────────────────────────────────────

CONTEXT & PROJECT OVERVIEW

You are an autonomous data acquisition agent working on the Feedify research project — an AI-driven smart food redistribution and waste minimization system for urban India. The system has 6 core components:

Surplus Prediction — ML model (Gradient Boosting) predicting food surplus from donor events

NGO Demand Prediction — Per-NGO Random Forest demand forecasting

PAPS Allocation — Perishability-Aware Priority Score for food allocation to NGOs

Route Optimization — Greedy + Two-Opt heuristic delivery routing

Clustering — K-Means donor pattern analysis

Fairness Analysis — Gini coefficient evaluation across allocation methods

Current problem: The entire dataset is synthetic (~2,000 donor records, 500 NGO profiles). The goal is to replace it with real-world data from public APIs and open government sources, covering 14 Indian cities and dates from 2020-01-01 to 2024-12-31. Target: 30,000+ donor surplus records, 500+ NGO profiles, real temperature data.

CRITICAL OPERATING RULES — READ BEFORE STARTING

Save a checkpoint file after EVERY part completes. Write checkpoint.json to track progress.

Never overwrite raw downloaded data. Save raw → process → save processed. Always keep the raw copy.

If any API call fails, log it to errors.log with timestamp and retry once after 5 seconds. If it fails again, skip and continue — do not halt the pipeline.

At the start of each part, read checkpoint.json first. If the part is already marked done: true, skip it entirely and move to the next.

All output files go into a folder called feedify_real_data/ with subfolders per part.

At the end of each part, print a clear summary: rows collected, files saved, any errors encountered.

Checkpoint File Format

{ "part1": {"done": false, "rows_collected": 0, "last_city": "", "timestamp": ""},

"part2": {"done": false, "rows_collected": 0, "timestamp": ""},

"part3": {"done": false, "rows_collected": 0, "timestamp": ""},

"part4": {"done": false, "rows_collected": 0, "timestamp": ""},

"part5": {"done": false, "timestamp": ""} }

FOLDER STRUCTURE TO CREATE AT START

feedify_real_data/

├── checkpoint.json

├── errors.log

├── part1_weather/

│   ├── raw/          ← raw API responses per city

│   └── processed/    ← cleaned CSVs

├── part2_ngo/

│   ├── raw/

│   └── processed/

├── part3_surplus/

│   ├── raw/

│   └── processed/

├── part4_integration/

│   └── processed/

└── part5_validation/

└── reports/

PART 1 OF 5 — WEATHER & TEMPERATURE DATA

PART 1 — Weather & Temperature Data

Source: Open-Meteo Historical API (Free, No API Key Required)

Objective

Fetch daily max/min/mean temperature for all 14 cities from 2020-01-01 to 2024-12-31. This replaces the synthetic temperature column used in perishability decay calculations (NC1, NC3 in the codebase).

City Coordinates (use exactly these)

API Endpoint

GET https://archive-api.open-meteo.com/v1/archive

?latitude={lat}&longitude={lon}

&start_date=2020-01-01&end_date=2024-12-31

&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max

&timezone=Asia%2FKolkata

Steps

Read checkpoint.json. If part1.done == true, skip entirely.

Create all folders listed above.

For each city: check if feedify_real_data/part1_weather/raw/{city}_raw.json already exists. If yes, skip API call (resume-safe). Make GET request. On HTTP 200: save raw JSON. On error: log to errors.log, retry once after 5s. Wait 1 second between city calls.

Parse all raw JSONs into a single DataFrame. Columns: date, city, temp_max, temp_min, temp_mean, precipitation_mm, windspeed_max. Drop rows where temp_mean is null.

Save to feedify_real_data/part1_weather/processed/weather_all_cities.csv and per-city CSVs.

Update checkpoint.json: set part1.done = true, part1.rows_collected = total_rows, part1.timestamp = now().

Validation Before Marking Done

Row count must be > 20,000 (at least 10 cities fully fetched)

temp_mean column must have < 5% null values

Date range must span 2020 to 2024

IMD Fallback Temperatures (if Open-Meteo fails)

If Open-Meteo completely fails for a city, use these constant mean temperatures with ±3°C seasonal random variation:

PART 2 OF 5 — NGO PROFILE DATA

PART 2 — NGO Profile Data

Source: NGO Darpan (Government of India) + Akshaya Patra + GitHub Fallback

Objective

Fetch real registered NGO profiles operating in food/nutrition/welfare sectors across the 14 target cities. This replaces the 500 synthetic NGO profiles.

Primary Source: NGO Darpan

Make POST requests to the NGO Darpan search endpoint for each state:

POST https://ngodarpan.gov.in/index.php/ajaxcontroller/search_index_new

Body: state_id={id}  sector_id=21  start=0  length=100

Fallback if NGO Darpan is Blocked (403)

GET https://raw.githubusercontent.com/DataKind-Bangalore/NGO-Data/master/NGO_data.csv

Filter: keep rows where sector contains 'food' OR 'nutrition' OR 'welfare' OR 'hunger'.

Akshaya Patra Kitchen Locations

GET https://www.akshayapatra.org/ourkitchens

Scrape kitchen location table: city, address, daily_meals_served. Map to NGO profile format.

Required Output Schema

Steps

Read checkpoint.json. If part2.done == true, skip entirely.

For each state: make POST request, save raw to part2_ngo/raw/{state}_ngo_raw.json. Wait 2 seconds between calls.

Parse responses. Geocode cities using CITIES dict with ±0.05 jitter. Estimate capacity by size. Assign storage_type.

Filter to keep only NGOs in the 14 target cities.

If total NGOs < 300 after filtering: augment by duplicating real NGOs with lat/lon variations, append _aug suffix to ngo_id. Log how many are augmented.

Save to feedify_real_data/part2_ngo/processed/ngo_profiles.csv.

Update checkpoint.json: part2.done = true.

PART 3 OF 5 — FOOD SURPLUS / DONOR EVENT DATA

PART 3 — Food Surplus / Donor Event Data

Sources: FAO (OWID), data.gov.in API, Real-Temperature-Calibrated Generation

Objective

Build 30,000+ real-calibrated donor surplus records using real anchors: FAO India waste statistics, census data, and FSSAI estimates. Pure real-world donor event logs don't exist publicly — we calibrate synthetic generation with real data.

Sub-Source A — FAO Food Waste Data

GET https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/

Food%20waste%20(FAO%2C%202021)/Food%20waste%20(FAO%2C%202021).csv

Extract India's food loss percentage by category. Use to calibrate surplus generation rates.

Sub-Source B — data.gov.in Food Production Data

GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

?api-key=579b464db66ec23bdd000001cdd3946e44ce4aab825abcbf30a0e6a

&format=json&limit=500&filters[state]={state}

Fetch for all 10 target states. On 401/403: skip this source; FAO calibration alone is sufficient.

Event Type Surplus Calibration (FSSAI 2023 Estimates)

Steps

Read checkpoint.json. If part3.done == true, skip entirely.

Fetch FAO CSV and save to part3_surplus/raw/fao_food_waste.csv.

Fetch data.gov.in for each state. Save per state. On 403: skip and log.

Load Part 1 weather data. If Part 1 not done, raise error: 'Run Part 1 first.'

Generate calibrated donor records: For each city × each date in 2020-2024, determine event count (Poisson lambda=4.5 normal, 8.5 on festival days). Generate surplus_kg from calibration params. Join real temperature from Part 1. Compute PI_final using real temp. Assign donor_id, food_type, is_festival_day.

Target: >= 30,000 rows. If date range exhausted before 30k, increase lambda to 7.0.

Save to part3_surplus/processed/donor_surplus_calibrated.csv.

Save calibration_sources.json documenting all parameters used.

Update checkpoint.json: part3.done = true.

Perishability Index Formula (use real temperature)

PI_base = PI_BASE_MAP[food_type]

heat_factor = max(0, (temp_mean - 25) / 15)

PI_final = min(1.0, PI_base + 0.15 * heat_factor)

PART 4 OF 5 — DISTANCE MATRIX & ROUTE DATA

PART 4 — Real Road Distance Matrix

Source: OpenStreetMap OSRM Public API (Free, No API Key)

Objective

Replace Haversine straight-line distances with real road distances. This is the key fix for the Two-Opt routing underperformance (currently losing to Greedy 68% of the time because road networks behave very differently from straight lines).

OSRM Route API

GET http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}

?overview=false&steps=false

OSRM Table API (Bulk — Much Faster)

GET http://router.project-osrm.org/table/v1/driving/

{lon1},{lat1};{lon2},{lat2};{lon3},{lat3};...

?sources=0&annotations=distance,duration

Steps

Read checkpoint.json. If part4.done == true, skip entirely.

Check that Part 2 is done. If not, raise error: 'Run Part 2 first.'

Load NGO profiles from part2_ngo/processed/ngo_profiles.csv.

For each city: get all NGOs in that city. Build OSRM Table API coordinate string (city centroid + all NGO coords). Check if raw file exists — if yes, skip. Call OSRM Table API. On failure: log error and fall back to Haversine for that city. Wait 1 second between cities.

Parse raw responses into distance matrix: columns = from_id, to_ngo_id, city, road_distance_km, road_duration_min, is_real_road_distance (bool). Convert meters → km, seconds → minutes.

Save to part4_integration/processed/distance_matrix_real.csv.

Join everything into master dataset: donor_surplus + ngo_profiles + weather + distance matrix. Add columns: nearest_ngo_id, nearest_ngo_distance_km, nearest_ngo_duration_min.

Save master joined file to part4_integration/processed/feedify_master_dataset.csv.

Update checkpoint.json: part4.done = true.

PART 5 OF 5 — VALIDATION & FINAL PACKAGING

PART 5 — Validation, Comparison & Final Packaging

No external sources — uses all outputs from Parts 1–4.

Objective

Validate the real data against the synthetic baseline, generate comparison statistics, and package everything cleanly so it can be directly dropped into the existing Feedify codebase under periRoute/data/processed/.

Step A — Statistical Comparison vs Synthetic Baseline

Save to part5_validation/reports/data_comparison_report.csv.

Step B — Data Quality Report

For each column in master dataset compute: null_count, null_pct, min, max, mean, std (numeric), unique_count (categorical), any_negative (quantity columns). Save to part5_validation/reports/data_quality_report.csv.

Step C — Codebase-Ready Files (4 files to generate)

Save all 4 files to: feedify_real_data/part5_validation/codebase_ready/

To use in codebase: copy these 4 files to helpforresearchpaper-main/feedify/periRoute/data/processed/ then re-run python part2_analysis.py — no other code changes needed.

RESUMING FROM ANY PART

If you had to stop mid-way, follow these steps:

Run: cat feedify_real_data/checkpoint.json — tells you exactly which parts are done.

Parts marked done: true will be skipped automatically.

For the part that was interrupted: raw files already downloaded will be skipped (file existence check). The part will resume from the first missing file.

Never manually edit checkpoint.json unless you want to force re-run a specific part.

To force re-run a specific part: set its done: false in checkpoint.json.

COMMON ERRORS & FIXES

"Create a folder called feedify_results_clean/ with subfolders: tables/ (all CSVs — model comparison, ablation, allocation, routing, clustering), graphs/ (all 14 PNGs renamed clearly: 01_surplus_by_city.png, 02_model_comparison.png, etc.), metrics/ (JSON summary of every key number: R², Gini, MAE, RMSE, Two-Opt win rate), and paper_ready/ (LaTeX tables auto-generated). Every file gets a 2-line README describing what it shows."

────────────────────────────────────────────────────────────────────────────────

Feedify Real Data Acquisition Pipeline — v1.0

Parts: 1-Weather  |  2-NGOs  |  3-Surplus  |  4-Distances  |  5-Packaging