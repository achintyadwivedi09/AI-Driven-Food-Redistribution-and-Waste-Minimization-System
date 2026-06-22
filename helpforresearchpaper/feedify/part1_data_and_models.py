import subprocess, sys, os, math, json, warnings, joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, asin, exp
from sklearn.ensemble import (RandomForestRegressor,
    GradientBoostingRegressor)
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.impute import KNNImputer
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import (mean_absolute_error,
    mean_squared_error, r2_score)
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score
from scipy import stats
from xgboost import XGBRegressor

def _ensure_deps():
    req = [
        ("pandas","pandas"),
        ("numpy","numpy"),
        ("sklearn","scikit-learn"),
        ("xgboost","xgboost"),
        ("matplotlib","matplotlib"),
        ("seaborn","seaborn"),
        ("scipy","scipy"),
        ("joblib","joblib"),
        ("requests","requests"),
        ("openpyxl","openpyxl"),
    ]
    missing = []
    for mod, pkg in req:
        try:
            __import__(mod)
        except Exception:
            missing.append(pkg)
    if not missing:
        return
    cmd = [
        sys.executable, "-m", "pip", "install",
        *missing,
        "--disable-pip-version-check",
        "--retries", "1",
        "--timeout", "60",
        "-q",
    ]
    subprocess.check_call(cmd)

_ensure_deps()

import requests
warnings.filterwarnings("ignore")
np.random.seed(42)
SEED = 42
BASE = "periRoute"

# Novel Contributions (label every one in code comments):
# NC1: Temperature-Aware Exponential Perishability Decay
# NC2: Dynamic NGO Demand Prediction via ML
# NC3: Weather-Adjusted Expiry Risk Scoring
# NC4: Fairness-Aware Allocation with Gini Monitoring
# NC5: Multi-Objective Pareto Scalarization
# NC6: Cold-Chain Compatibility Routing

# ── BLOCK 1: CREATE FOLDERS ──────────────────────────────

for folder in [
    f"{BASE}/data/raw", f"{BASE}/data/processed",
    f"{BASE}/models", f"{BASE}/results/metrics",
    f"{BASE}/results/figures", f"{BASE}/results/tables",
    f"{BASE}/paper", f"{BASE}/api"]:
    os.makedirs(folder, exist_ok=True)
print(">>> BLOCK 1 DONE: Folders created")

# ── BLOCK 2: DOWNLOAD REAL DATA (fallback to synthetic) ──

fao_loss_pct = 30.0
fao_source   = "synthetic (FAO 2021 calibrated)"
try:
    url = ("https://raw.githubusercontent.com/owid/"
           "owid-datasets/master/datasets/Food%20waste"
           "%20(FAO%2C%202021)/Food%20waste%20(FAO%2C"
           "%202021).csv")
    r = requests.get(url, timeout=10)
    df_fao = pd.read_csv(pd.io.common.StringIO(r.text))
    num_cols = df_fao.select_dtypes(include=np.number).columns
    fao_loss_pct = float(df_fao[num_cols[-1]].dropna().mean())
    fao_source = "REAL: OWID/FAO 2021"
except Exception as e:
    print(f"  FAO download failed: {e}. Using synthetic.")

hunger_pct = 14.0
wb_source  = "synthetic (World Bank 2023 calibrated)"
try:
    url2 = ("https://api.worldbank.org/v2/country/IN/"
            "indicator/SN.ITK.DEFC.ZS?format=json&per_page=30")
    r2 = requests.get(url2, timeout=10)
    wb_json = r2.json()
    vals = [x["value"] for x in wb_json[1]
            if x.get("value") is not None]
    hunger_pct = float(np.mean(vals))
    wb_source  = "REAL: World Bank API"
except Exception as e:
    print(f"  WorldBank download failed: {e}. Using synthetic.")

json.dump({"fao_loss_pct": fao_loss_pct,
           "hunger_pct": hunger_pct,
           "fao_source": fao_source,
           "wb_source": wb_source},
          open(f"{BASE}/models/data_config.json","w"))
print(f">>> BLOCK 2 DONE: FAO={fao_source} | WB={wb_source}")

# ── BLOCK 3: GENERATE DONOR SURPLUS (SCALED: 30000 rows) ──────────

# Mandatory scaling: add more Indian cities (Prayagraj, Lucknow, Surat, Indore, Nagpur, Kochi)
# and extend time range to 2020-01-01 ... 2024-12-31 before any model training.
CITIES = {
    "Mumbai":    (19.0760, 72.8777),
    "Delhi":     (28.6139, 77.2090),
    "Chennai":   (13.0827, 80.2707),
    "Bengaluru": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867),
    "Kolkata":   (22.5726, 88.3639),
    "Pune":      (18.5204, 73.8567),
    "Ahmedabad": (23.0225, 72.5714),
    "Prayagraj": (25.4358, 81.8463),
    "Lucknow":   (26.8467, 80.9462),
    "Surat":     (21.1702, 72.8311),
    "Indore":    (22.7196, 75.8577),
    "Nagpur":    (21.1458, 79.0882),
    "Kochi":     (9.9312, 76.2673),
}

EVENT_TYPES = ["Wedding","Corporate","Restaurant",
               "Temple","College Canteen","Hospital"]
FOOD_TYPES  = ["Rice","Dal","Sabzi","Roti",
               "Biryani","Sweets","Salad"]
PI_BASE_MAP = {"Rice":0.60,"Dal":0.55,"Sabzi":0.80,
               "Roti":0.70,"Biryani":0.75,
               "Sweets":0.65,"Salad":0.90}

FESTIVAL_MD = [(1,14),(1,26),(3,18),(4,14),(8,15),(10,2),(10,24),(11,8),(12,25),(9,19),(11,13),(3,7)]
FESTIVALS = set()
for yr in [2020,2021,2022,2023,2024]:
    for m,d in FESTIVAL_MD:
        try:
            FESTIVALS.add(datetime(yr,m,d).strftime("%Y-%m-%d"))
        except Exception:
            pass

start = datetime(2020,1,1)
end   = datetime(2024,12,31)
days  = (end - start).days
rows  = []
for i in range(30000):
    city = np.random.choice(list(CITIES.keys()))
    clat, clon = CITIES[city]
    ev   = np.random.choice(EVENT_TYPES)
    ft   = np.random.choice(FOOD_TYPES)
    dt   = start + timedelta(days=int(np.random.randint(0,days+1)))
    ds   = dt.strftime("%Y-%m-%d")
    is_f = 1 if ds in FESTIVALS else 0
    is_w = 1 if dt.weekday() >= 5 else 0
    qty  = float(np.clip(np.random.normal(80,30),10,300))
    lr   = float(np.clip(
               fao_loss_pct/100 + np.random.normal(0,0.05),
               0.05, 0.65))
    surp = qty * lr
    if is_f: surp *= 1.40
    if is_w: surp *= 1.20
    if dt.month in [4,5,6]: surp *= 0.90
    surp = float(np.clip(surp, 0, qty*0.80))
    temp = float(np.clip(np.random.normal(28,6),15,45))
    hum  = float(np.clip(np.random.normal(65,15),30,95))
    hrs  = float(np.random.uniform(0,8))
    pi_b = PI_BASE_MAP[ft]
    k    = 0.05
    # NC1: Temperature decay
    pi_d = float(np.clip(
               pi_b * exp(k * max(0, temp-25) * hrs),
               pi_b, 1.0))
    # NC3: Weather risk
    hi   = temp + 0.33*hum - 4.0
    er   = 1.0/(1.0+exp(-0.1*(hi-35)))
    pi_f = float(np.clip(pi_d*(1+er), 0, 1))
    dlat = clat + np.random.normal(0,0.04)
    dlon = clon + np.random.normal(0,0.04)
    rows.append({
        "donor_id":        f"D{i:05d}",
        "date":            ds,
        "city":            city,
        "event_type":      ev,
        "food_type":       ft,
        "qty_prepared_kg": qty,
        "qty_consumed_kg": qty - surp,
        "surplus_kg":      surp,
        "temperature":     temp,
        "humidity":        hum,
        "hours_since_prep":hrs,
        "day_of_week":     dt.weekday(),
        "is_weekend":      is_w,
        "is_festival_day": is_f,
        "PI_base":         pi_b,
        "PI_decay":        pi_d,
        "heat_index":      hi,
        "expiry_risk":     er,
        "PI_final":        pi_f,
        "donor_lat":       dlat,
        "donor_lon":       dlon})

donor_df = pd.DataFrame(rows)

# Add 5% NaN to numeric columns
for col in ["qty_prepared_kg","temperature",
            "humidity","surplus_kg"]:
    idx = donor_df.sample(frac=0.05, random_state=SEED).index
    donor_df.loc[idx, col] = np.nan

donor_df.to_csv(
    f"{BASE}/data/processed/donor_surplus.csv", index=False)
print(f">>> BLOCK 3 DONE: donor_surplus.csv ({len(donor_df)} rows)")

# ── BLOCK 4: GENERATE NGO DATASET (SCALED: 500 rows) ─────────────

NGO_NAMES = ["Asha Foundation","Seva Sangam","Annadan Trust",
             "Roti Bank","Jan Seva","Annapoorna Trust",
             "Food For All","Hunger Free India"]
STORAGE   = ["dry","cold","none"]
ST_WT     = [0.40, 0.35, 0.25]

ngo_rows = []
for i in range(500):
    city   = np.random.choice(list(CITIES.keys()))
    clat, clon = CITIES[city]
    cap    = float(np.clip(
                 np.random.lognormal(5.0,0.6), 50, 800))
    dem    = cap * np.random.uniform(0.70, 0.95)
    st     = np.random.choice(STORAGE, p=ST_WT)
    adm    = dem * np.random.uniform(0.9,1.1)
    dvs    = adm * np.random.uniform(0.05,0.20)
    ngo_rows.append({
        "ngo_id":               f"NGO_{i:03d}",
        "ngo_name":             f"{np.random.choice(NGO_NAMES)} {city}",
        "city":                 city,
        "ngo_lat":              clat + np.random.normal(0,0.04),
        "ngo_lon":              clon + np.random.normal(0,0.04),
        "capacity_kg":          round(cap,2),
        "current_demand_kg":    round(dem,2),
        "storage_type":         st,
        "storage_capacity_kg":  round(cap*np.random.uniform(0.5,1.0),2),
        "avg_daily_demand_kg":  round(adm,2),
        "demand_variability_std":round(dvs,2),
        "priority_tier":        int(np.random.choice([1,2,3],
                                    p=[0.3,0.4,0.3])),
        "allocation_count":     0})

ngo_df = pd.DataFrame(ngo_rows)
ngo_df.to_csv(
    f"{BASE}/data/processed/ngo_demand.csv", index=False)
print(f">>> BLOCK 4 DONE: ngo_demand.csv ({len(ngo_df)} rows)")

# ── BLOCK 5: NGO DEMAND TIMESERIES (SCALED: 2020–2024) ───────────────────────

ts_rows = []
dates_ts = pd.date_range("2020-01-01","2024-12-31",freq="D")
for _, ngo in ngo_df.iterrows():
    base = ngo["avg_daily_demand_kg"]
    vstd = ngo["demand_variability_std"]
    for dt in dates_ts:
        d = float(base)
        if dt.weekday() >= 5: d *= 0.85
        if dt.strftime("%Y-%m-%d") in FESTIVALS: d *= 1.30
        d += np.random.normal(0, vstd)
        d  = float(np.clip(d, base*0.3, ngo["capacity_kg"]))
        ts_rows.append({"ngo_id":ngo["ngo_id"],
                         "date":dt.strftime("%Y-%m-%d"),
                         "demand_kg":round(d,2)})

ts_df = pd.DataFrame(ts_rows)
ts_df.to_csv(
    f"{BASE}/data/processed/ngo_demand_timeseries.csv",
    index=False)
print(f">>> BLOCK 5 DONE: timeseries ({len(ts_df)} rows)")

# ── BLOCK 6: HAVERSINE DISTANCE MATRIX ───────────────────

def haversine(lat1,lon1,lat2,lon2):
    R = 6371.0
    dlat = radians(lat2-lat1)
    dlon = radians(lon2-lon1)
    a = (sin(dlat/2)**2 +
         cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2)
    return R * 2 * asin(sqrt(max(0,min(1,a))))

# Execution optimization: with 30,000 donors and 500 NGOs, a full dense matrix
# would be extremely large. We save a representative matrix for a fixed sample
# of donors; part2 includes a safe fallback to on-the-fly haversine when missing.
donor_sample = donor_df.sample(n=min(5000, len(donor_df)), random_state=SEED)

dist_data = {}
for _, d_row in donor_sample.iterrows():
    row_dist = {}
    for _, n_row in ngo_df.iterrows():
        row_dist[n_row["ngo_id"]] = round(
            haversine(d_row["donor_lat"], d_row["donor_lon"],
                      n_row["ngo_lat"],  n_row["ngo_lon"]), 3)
    dist_data[d_row["donor_id"]] = row_dist

dist_df = pd.DataFrame(dist_data).T
dist_df.to_csv(f"{BASE}/data/processed/distance_matrix.csv")
print(f">>> BLOCK 6 DONE: distance_matrix ({dist_df.shape})")

# ── BLOCK 7: PREPROCESSING ───────────────────────────────

df = donor_df.copy()
df["date"] = pd.to_datetime(df["date"])

# KNN impute numeric
num_cols = ["qty_prepared_kg","temperature",
            "humidity","surplus_kg"]
imputer  = KNNImputer(n_neighbors=5)
df[num_cols] = imputer.fit_transform(df[num_cols])

# Winsorize
for col in num_cols:
    Q1,Q3  = df[col].quantile(0.25), df[col].quantile(0.75)
    IQR    = Q3-Q1
    df[col]= df[col].clip(Q1-1.5*IQR, Q3+1.5*IQR)

# Feature engineering
df = df.sort_values("date").reset_index(drop=True)
df["month"]       = df["date"].dt.month
df["quarter"]     = df["date"].dt.quarter
df["week_of_year"]= df["date"].dt.isocalendar().week.astype(int)
df["surplus_lag_1"]       = df["surplus_kg"].shift(1)
df["surplus_lag_7"]       = df["surplus_kg"].shift(7)
df["surplus_rolling_mean_7"]= df["surplus_kg"].rolling(7).mean()
df["surplus_rolling_std_7"] = df["surplus_kg"].rolling(7).std()

for col in ["surplus_lag_1","surplus_lag_7",
            "surplus_rolling_mean_7","surplus_rolling_std_7"]:
    df[col].fillna(df[col].median(), inplace=True)

# One-hot encode
df = pd.get_dummies(df,
    columns=["city","event_type","food_type"],
    drop_first=False)

# Keep raw surplus
df["surplus_kg_raw"] = df["surplus_kg"].copy()

# Scale
scale_cols = ["qty_prepared_kg","qty_consumed_kg","surplus_kg"]
scaler = MinMaxScaler()
df[scale_cols] = scaler.fit_transform(df[scale_cols])
joblib.dump(scaler, f"{BASE}/models/surplus_scaler.pkl")

# Time split
df = df.sort_values("date").reset_index(drop=True)
split = int(len(df)*0.80)
train_df = df.iloc[:split]
test_df  = df.iloc[split:]

drop_cols = ["donor_id","date","surplus_kg_raw",
             "surplus_kg","qty_consumed_kg"]
feat_cols = [c for c in df.columns if c not in drop_cols
             and df[c].dtype in [np.float64,np.int64,
                                  np.uint8,bool]]
joblib.dump(feat_cols, f"{BASE}/models/feature_columns.pkl")

X_train = train_df[feat_cols].fillna(0)
y_train = train_df["surplus_kg"]
X_test  = test_df[feat_cols].fillna(0)
y_test_raw = test_df["surplus_kg_raw"]

print(f">>> BLOCK 7 DONE: train={len(X_train)} test={len(X_test)}")

# ── BLOCK 8: TRAIN 4 ML MODELS ───────────────────────────

results = []

def get_metrics(y_true, y_pred):
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2   = r2_score(y_true, y_pred)
    mape = float(np.mean(
               np.abs((y_true-y_pred)/(y_true+1e-9))))*100
    return mae, rmse, r2, mape

def inverse_surplus(y_scaled):
    dummy = np.zeros((len(y_scaled),
                      len(scale_cols)))
    dummy[:,scale_cols.index("surplus_kg")] = y_scaled
    return scaler.inverse_transform(dummy)[
               :, scale_cols.index("surplus_kg")]

# Model 1: Linear Regression
lr = LinearRegression()
lr.fit(X_train, y_train)
pred_lr = inverse_surplus(lr.predict(X_test))
mae,rmse,r2,mape = get_metrics(y_test_raw.values, pred_lr)
results.append({"Model":"LinearRegression",
                "MAE":mae,"RMSE":rmse,"R2":r2,"MAPE":mape})
print(f"  LR done: R2={r2:.4f}")

# Model 2: Random Forest (GridSearch kept small for scaled data)
rf_grid = GridSearchCV(
    RandomForestRegressor(random_state=SEED, n_jobs=-1),
    {"n_estimators":[200],
     "max_depth":[10, None],
     "min_samples_split":[2]},
    cv=3, scoring="r2", n_jobs=-1, verbose=0)
rf_grid.fit(X_train, y_train)
best_rf = rf_grid.best_estimator_
pred_rf = inverse_surplus(best_rf.predict(X_test))
mae,rmse,r2,mape = get_metrics(y_test_raw.values, pred_rf)
results.append({"Model":"RandomForest",
                "MAE":mae,"RMSE":rmse,"R2":r2,"MAPE":mape,
                "best_params":str(rf_grid.best_params_)})
print(f"  RF done: R2={r2:.4f} params={rf_grid.best_params_}")

# Model 3: XGBoost (GridSearch kept small for scaled data)
xgb_grid = GridSearchCV(
    XGBRegressor(random_state=SEED,verbosity=0, n_jobs=-1),
    {"n_estimators":[300],
     "learning_rate":[0.05,0.1],
     "max_depth":[5],
     "subsample":[0.8]},
    cv=3, scoring="r2", n_jobs=-1, verbose=0)
xgb_grid.fit(X_train, y_train)
best_xgb = xgb_grid.best_estimator_
pred_xgb = inverse_surplus(best_xgb.predict(X_test))
mae,rmse,r2,mape = get_metrics(y_test_raw.values, pred_xgb)
results.append({"Model":"XGBoost",
                "MAE":mae,"RMSE":rmse,"R2":r2,"MAPE":mape,
                "best_params":str(xgb_grid.best_params_)})
print(f"  XGB done: R2={r2:.4f} params={xgb_grid.best_params_}")

# Model 4: Gradient Boosting (GridSearch kept small for scaled data)
gb_grid = GridSearchCV(
    GradientBoostingRegressor(random_state=SEED),
    {"n_estimators":[200],
     "learning_rate":[0.05,0.1],
     "max_depth":[3,5]},
    cv=3, scoring="r2", n_jobs=-1, verbose=0)
gb_grid.fit(X_train, y_train)
best_gb = gb_grid.best_estimator_
pred_gb = inverse_surplus(best_gb.predict(X_test))
mae,rmse,r2,mape = get_metrics(y_test_raw.values, pred_gb)
results.append({"Model":"GradientBoosting",
                "MAE":mae,"RMSE":rmse,"R2":r2,"MAPE":mape,
                "best_params":str(gb_grid.best_params_)})
print(f"  GB done: R2={r2:.4f} params={gb_grid.best_params_}")

metrics_df = pd.DataFrame(results)
metrics_df.to_csv(
    f"{BASE}/results/metrics/surplus_model_comparison.csv",
    index=False)

best_idx  = metrics_df["R2"].idxmax()
best_name = metrics_df.loc[best_idx,"Model"]
best_map  = {"RandomForest":best_rf,
             "XGBoost":best_xgb,
             "GradientBoosting":best_gb,
             "LinearRegression":lr}
best_model = best_map[best_name]
best_pred  = {"RandomForest":pred_rf,
              "XGBoost":pred_xgb,
              "GradientBoosting":pred_gb,
              "LinearRegression":pred_lr}[best_name]

joblib.dump(best_model,
            f"{BASE}/models/best_surplus_model.pkl")
joblib.dump({"name":best_name,
             "predictions":best_pred.tolist(),
             "y_true":y_test_raw.tolist(),
             "X_test_index":list(test_df.index)},
            f"{BASE}/models/test_results.pkl")

print(f"\n>>> BLOCK 8 DONE: Best={best_name} "
      f"R2={metrics_df.loc[best_idx,'R2']:.4f} "
      f"RMSE={metrics_df.loc[best_idx,'RMSE']:.2f}")

# ── BLOCK 9: NC2 DYNAMIC NGO DEMAND PREDICTION ───────────

ts_df2 = pd.read_csv(
    f"{BASE}/data/processed/ngo_demand_timeseries.csv")
ts_df2["date"] = pd.to_datetime(ts_df2["date"])
ts_df2 = ts_df2.sort_values(["ngo_id","date"])
ts_df2["dow"]   = ts_df2["date"].dt.dayofweek
ts_df2["month"] = ts_df2["date"].dt.month
ts_df2["is_festival"] = ts_df2["date"].dt.strftime(
    "%Y-%m-%d").isin(FESTIVALS).astype(int)
ts_df2["lag1"] = ts_df2.groupby("ngo_id")["demand_kg"].shift(1)
ts_df2["lag7"] = ts_df2.groupby("ngo_id")["demand_kg"].shift(7)
ts_df2["roll7"]= ts_df2.groupby("ngo_id")["demand_kg"].transform(
    lambda x: x.rolling(7).mean())
ts_df2 = ts_df2.dropna()

ngo_demand_pred = {}
demand_results  = []
FEAT_D = ["dow","month","is_festival","lag1","lag7","roll7"]

for nid in ts_df2["ngo_id"].unique():
    sub = ts_df2[ts_df2["ngo_id"]==nid].reset_index(drop=True)
    sp  = int(len(sub)*0.80)
    Xd_tr = sub[FEAT_D].iloc[:sp]
    yd_tr = sub["demand_kg"].iloc[:sp]
    Xd_te = sub[FEAT_D].iloc[sp:]
    yd_te = sub["demand_kg"].iloc[sp:]
    if len(Xd_te) < 5:
        ngo_demand_pred[nid] = float(yd_tr.mean())
        continue
    m = RandomForestRegressor(n_estimators=50,
                               random_state=SEED, n_jobs=-1)
    m.fit(Xd_tr, yd_tr)
    prd = m.predict(Xd_te)
    mae_d = mean_absolute_error(yd_te, prd)
    r2_d  = r2_score(yd_te, prd)
    ngo_demand_pred[nid] = float(prd[-1])
    demand_results.append({"ngo_id":nid,
                            "MAE":mae_d,"R2":r2_d})

json.dump(ngo_demand_pred,
          open(f"{BASE}/models/ngo_predicted_demand.json","w"))
pd.DataFrame(demand_results).to_csv(
    f"{BASE}/results/metrics/demand_prediction_metrics.csv",
    index=False)
print(f">>> BLOCK 9 DONE: NC2 demand predictions saved "
      f"avg_MAE={np.mean([x['MAE'] for x in demand_results]):.2f}")

print("\n" + "="*55)
print("  PART 1 COMPLETE")
print(f"  Best surplus model : {best_name}")
print(f"  R2={metrics_df.loc[best_idx,'R2']:.4f}  "
      f"RMSE={metrics_df.loc[best_idx,'RMSE']:.2f}  "
      f"MAE={metrics_df.loc[best_idx,'MAE']:.2f}")
print(f"  FAO source  : {fao_source}")
print(f"  WBank source: {wb_source}")
print("  Run part2_analysis.py next")
print("="*55)
