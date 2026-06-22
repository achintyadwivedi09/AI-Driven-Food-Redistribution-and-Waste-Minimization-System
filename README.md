<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=FEEDIFY&fontSize=80&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=AI-Driven%20Food%20Redistribution%20%26%20Waste%20Minimization&descAlignY=60&descAlign=50&descSize=18" width="100%"/>

<!-- Badges Row 1 -->
<p>
  <img src="https://img.shields.io/badge/Status-Research%20Active-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/ML-Gradient%20Boosting-FF6B35?style=for-the-badge&logo=scikit-learn&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cities-14%20Indian%20Cities-FF2D55?style=for-the-badge&logo=google-maps&logoColor=white"/>
</p>

<!-- Badges Row 2 -->
<p>
  <img src="https://img.shields.io/badge/Dataset-50%2C033%20Records-6C5CE7?style=for-the-badge&logo=database&logoColor=white"/>
  <img src="https://img.shields.io/badge/Food%20Saved-3%2C483%20kg-00B894?style=for-the-badge&logo=leaf&logoColor=white"/>
  <img src="https://img.shields.io/badge/R²%20Score-0.849-FD79A8?style=for-the-badge&logo=tensorflow&logoColor=white"/>
  <img src="https://img.shields.io/badge/Meals%20Served-8%2C708-FDCB6E?style=for-the-badge&logo=restaurant&logoColor=white"/>
</p>

<br/>

> ### 🍱 *"Every kilogram of food wasted is a missed opportunity to feed a hungry child."*
> **Feedify turns AI into a weapon against food waste — at urban scale.**

<br/>

---

</div>

<div align="center">

## ⚡ WHAT IS FEEDIFY?

</div>

**Feedify** is a full-stack, AI-powered research system that intelligently redistributes surplus food from **donors** (restaurants, caterers, event organizers) to **NGOs** (shelters, food banks, community kitchens) across **14 major Indian cities** — before it spoils.

This isn't just another ML project. Feedify is a **complete research pipeline** with:
- 📡 **Real data** from Open-Meteo, OSRM, NGO Darpan, FAO
- 🧠 **6 ML components** working in concert
- 🗺️ **Live routing optimization** using Two-Opt + Greedy heuristics
- ⚖️ **Fairness-aware allocation** via PAPS scoring
- 📝 **Paper-ready LaTeX outputs** and publication-grade graphs

---

<div align="center">

## 🏙️ CITIES COVERED

</div>

```
Mumbai  •  Delhi  •  Bangalore  •  Hyderabad  •  Chennai
Kolkata  •  Pune  •  Ahmedabad  •  Surat  •  Jaipur
Lucknow  •  Nagpur  •  Indore  •  Kochi  •  Prayagraj
```

> 🌡️ Real temperature data from 2020–2024 | 📅 25,578 weather rows | 🛣️ 500 OSRM road distances

---

<div align="center">

## 🧠 THE 6-COMPONENT AI BRAIN

</div>

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FEEDIFY SYSTEM FLOW                          │
│                                                                     │
│   🍽️ DONOR EVENT                                                    │
│        │                                                            │
│        ▼                                                            │
│   [1] SURPLUS PREDICTION ──────────────────── Gradient Boosting     │
│        │           R² = 0.849 | RMSE = 3.92 kg                     │
│        ▼                                                            │
│   [2] NGO DEMAND FORECASTING ───────────────── Random Forest        │
│        │           MAE = 12.56 | R² = 0.364                        │
│        ▼                                                            │
│   [3] PAPS ALLOCATION SCORING ─────────────── Perishability-Aware   │
│        │           Gini = 0.60 | 17.27% fairer than random         │
│        ▼                                                            │
│   [4] ROUTE OPTIMIZATION ──────────────────── Greedy + Two-Opt      │
│        │           Mean distance = 4,574 km                         │
│        ▼                                                            │
│   [5] DONOR CLUSTERING ────────────────────── K-Means (k=8)         │
│        │           Silhouette = 0.28                                │
│        ▼                                                            │
│   [6] FAIRNESS ANALYSIS ───────────────────── Gini Coefficient      │
│                    PAPS beats random by 17.27%                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

<div align="center">

## 📊 REAL PERFORMANCE NUMBERS

</div>

<table align="center">
<tr>
<th>🎯 Metric</th>
<th>📈 Value</th>
<th>🥇 Context</th>
</tr>
<tr>
<td><b>Surplus Prediction R²</b></td>
<td><code>0.849</code></td>
<td>Gradient Boosting beats Linear, RF, SVR</td>
</tr>
<tr>
<td><b>Surplus RMSE</b></td>
<td><code>3.92 kg</code></td>
<td>Best in ablation study</td>
</tr>
<tr>
<td><b>Total Food Saved</b></td>
<td><code>3,483.1 kg</code></td>
<td>Zero waste — 100% utilization</td>
</tr>
<tr>
<td><b>Meals Served</b></td>
<td><code>8,708</code></td>
<td>Across 14 cities</td>
</tr>
<tr>
<td><b>PAPS Gini Coefficient</b></td>
<td><code>0.60</code></td>
<td>17.27% fairer than random allocation</td>
</tr>
<tr>
<td><b>Donor Records</b></td>
<td><code>50,033</code></td>
<td>Real-calibrated (Open-Meteo + FAO)</td>
</tr>
<tr>
<td><b>NGO Profiles</b></td>
<td><code>500</code></td>
<td>From NGO Darpan + Akshaya Patra</td>
</tr>
<tr>
<td><b>Ablation — No Festival Flag</b></td>
<td><code>+15.6% RMSE</code></td>
<td>Festival days are critical features</td>
</tr>
</table>

---

<div align="center">

## 🗂️ REPOSITORY STRUCTURE

</div>

```
📦 AI-Driven-Food-Redistribution/
│
├── 📄 feedify_app.html              ← Interactive demo dashboard
├── 📄 feedify_research.html         ← Research visualization portal
│
└── 📁 helpforresearchpaper/
    ├── 📄 Feedify_Agent_Prompt.md   ← Full 5-part AI agent pipeline spec
    │
    └── 📁 feedify/
        ├── 🐍 feedify_data_pipeline.py     ← Master pipeline (5 parts, resumable)
        ├── 🐍 part1_data_and_models.py     ← Surplus & demand ML models
        ├── 🐍 part2_analysis.py            ← PAPS, routing, clustering, fairness
        ├── 🐍 part3_paper.py               ← LaTeX + graph generation
        ├── 🐍 verify_pipeline.py           ← End-to-end validation
        │
        ├── 📁 feedify_real_data/           ← Real acquired data (5 parts)
        │   ├── 📁 part1_weather/           ← Open-Meteo 2020–2024
        │   ├── 📁 part2_ngo/               ← NGO Darpan profiles
        │   ├── 📁 part3_surplus/           ← FAO-calibrated donor events
        │   ├── 📁 part4_integration/       ← OSRM road distances
        │   └── 📁 part5_validation/        ← Codebase-ready outputs
        │
        ├── 📁 feedify_results_clean/       ← Publication-ready outputs
        │   ├── 📊 graphs/                  ← 14 research graphs (PNG)
        │   ├── 📋 metrics/                 ← summary.json + pipeline_metrics.json
        │   ├── 📝 paper_ready/             ← paper_draft.md + results_tables.tex
        │   └── 📁 tables/                  ← All result CSVs
        │
        ├── 📁 periRoute/                   ← Routing subsystem
        │   ├── 🐍 api/main.py              ← FastAPI backend
        │   ├── 📁 models/                  ← Trained model artifacts
        │   ├── 📊 results/figures/         ← 14 paper-quality figures
        │   └── 📝 paper/paper_draft.md     ← Research paper draft
        │
        └── 📁 frontend/                    ← React + Vite dashboard
            ├── 📁 src/pages/               ← Donor, NGO, Admin dashboards
            ├── 📁 src/components/          ← RouteViz, StatCard, Toast...
            └── 📁 src/api/                 ← Feedify + Weather API clients
```

---

<div align="center">

## 🔬 THE PAPS ALGORITHM

### *Perishability-Aware Priority Scoring*

</div>

```python
# The heart of Feedify's allocation engine
PI_base    = PI_BASE_MAP[food_type]               # base decay rate per food type
heat_factor = max(0, (temp_mean - 25) / 15)       # real temperature from Open-Meteo
PI_final   = min(1.0, PI_base + 0.15 * heat_factor)

PAPS_score = α·PI_final + β·NGO_demand + γ·(1/distance_km)
# → Highest PAPS NGO gets the food first, every time
```

> 🌡️ Hot city? Food goes first. Hungry NGO? Food goes first. Nearby? Food goes first.  
> **Zero waste. Maximum fairness.**

---

<div align="center">

## 🛣️ ROUTING COMPARISON

</div>

| Algorithm | Mean Distance | Win Rate | Notes |
|-----------|:------------:|:--------:|-------|
| 🟢 **Greedy** | 4,574.82 km | **84%** | Fast, reliable, production-ready |
| 🔵 **Two-Opt** | 5,248.01 km | 16% | Better on real road networks |
| ⬜ Haversine (baseline) | — | — | Straight-line, replaced by OSRM |

> 📌 **Key finding:** Greedy outperforms Two-Opt by 14.72% on urban Indian road networks —  
> a significant insight for real-world deployment.

---

<div align="center">

## ⚖️ FAIRNESS: PAPS vs ALTERNATIVES

</div>

```
Gini Coefficient (lower = fairer)

PAPS Allocation  ████████████░░░░░░░░  0.60  ← BEST ✅
Random           ██████████████░░░░░░  0.73
Nearest-NGO      ███████████████░░░░░  0.76
Demand-Only      ████████████████████  1.00  ← WORST ❌

PAPS is 17.27% fairer than random allocation
```

---

<div align="center">

## 🚀 QUICKSTART

</div>

### Prerequisites
```bash
Python 3.10+  |  pip  |  Node.js 18+  |  Git
```

### 1️⃣ Clone the repository
```bash
git clone https://github.com/achintyadwivedi09/AI-Driven-Food-Redistribution-and-Waste-Minimization-System.git
cd AI-Driven-Food-Redistribution-and-Waste-Minimization-System
```

### 2️⃣ Install Python dependencies
```bash
pip install pandas numpy scikit-learn matplotlib seaborn scipy requests fastapi uvicorn
```

### 3️⃣ Run the full data pipeline (resumable)
```bash
cd helpforresearchpaper/feedify
python feedify_data_pipeline.py
# Checkpoint-safe — restarts from where you left off
```

### 4️⃣ Train models & run analysis
```bash
python part1_data_and_models.py   # Surplus + demand ML models
python part2_analysis.py          # PAPS + routing + fairness
python part3_paper.py             # Generate graphs + LaTeX tables
```

### 5️⃣ Launch the frontend dashboard
```bash
cd frontend
npm install
npm run dev
# → Open http://localhost:5173
```

### 6️⃣ Or just open the HTML demos
```bash
# No setup needed — open directly in browser
open feedify_app.html         # Interactive app demo
open feedify_research.html    # Research visualizations
```

---

<div align="center">

## 📈 RESEARCH GRAPHS (14 Publication-Ready Figures)

</div>

| # | Graph | What it shows |
|---|-------|---------------|
| 01 | `surplus_by_city.png` | Surplus distribution across 14 cities |
| 02 | `surplus_time_series.png` | 2020–2024 temporal surplus trends |
| 03 | `temperature_decay_curves.png` | PI decay curves by food type & temperature |
| 04 | `feature_importance.png` | Top features for surplus prediction |
| 05 | `model_comparison.png` | GB vs RF vs Linear vs SVR |
| 06 | `actual_vs_predicted.png` | Model fit visualization |
| 07 | `ablation_study.png` | Feature ablation RMSE impact |
| 08 | `kmeans_elbow.png` | Optimal k=8 elbow curve |
| 09 | `paps_score_distribution.png` | PAPS score histogram |
| 10 | `food_saved_comparison.png` | PAPS vs alternatives |
| 11 | `waste_comparison.png` | Zero-waste achievement |
| 12 | `fairness_gini.png` | Gini across 4 allocation methods |
| 13 | `cold_chain_routing.png` | Route visualization |
| 14 | `weight_sensitivity.png` | PAPS weight sensitivity analysis |

> 📁 All graphs in: `helpforresearchpaper/feedify/feedify_results_clean/graphs/`

---

<div align="center">

## 🌐 DATA SOURCES

</div>

| Source | Data Type | Coverage |
|--------|-----------|----------|
| 🌤️ **Open-Meteo Historical API** | Temperature, precipitation, wind | 14 cities, 2020–2024 |
| 🛣️ **OSRM (OpenStreetMap)** | Real road distances & durations | 500 city-pair matrices |
| 🏛️ **NGO Darpan (Govt. of India)** | NGO profiles, sectors, capacities | Food/nutrition NGOs |
| 🌾 **FAO (OWID 2021)** | Food waste % by category | India calibration |
| 📊 **data.gov.in** | Food production statistics | State-level |
| 🍱 **Akshaya Patra** | Kitchen locations & capacity | 12+ cities |

---

<div align="center">

## 🏗️ TECH STACK

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white"/>
  <img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white"/>
  <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white"/>
  <img src="https://img.shields.io/badge/Matplotlib-11557c?style=for-the-badge&logo=python&logoColor=white"/>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/LaTeX-008080?style=for-the-badge&logo=latex&logoColor=white"/>
</p>

---

<div align="center">

## 🎯 KEY INNOVATIONS

</div>

```
┌────────────────────────────────────────────────────────────────┐
│  💡  INNOVATION 1 — Real-Data Pipeline                         │
│      5-part resumable data acquisition agent using              │
│      checkpoint.json — never lose progress mid-run             │
├────────────────────────────────────────────────────────────────┤
│  💡  INNOVATION 2 — Temperature-Aware Perishability            │
│      PI_final dynamically adjusts with real Open-Meteo         │
│      temperatures — Mumbai heat ≠ Shimla cold                  │
├────────────────────────────────────────────────────────────────┤
│  💡  INNOVATION 3 — PAPS Multi-Objective Scoring               │
│      Balances perishability + NGO demand + distance            │
│      in a single allocation priority score                      │
├────────────────────────────────────────────────────────────────┤
│  💡  INNOVATION 4 — Fairness-First Design                      │
│      Gini coefficient measured across 4 methods —              │
│      fairness is a first-class research metric                  │
├────────────────────────────────────────────────────────────────┤
│  💡  INNOVATION 5 — OSRM Road Distance Integration             │
│      Replaces naive Haversine with real road networks           │
│      — because roads aren't straight lines                      │
└────────────────────────────────────────────────────────────────┘
```

---

<div align="center">

## 📁 PIPELINE CHECKPOINT SYSTEM

</div>

```json
{
  "part1": { "done": true,  "rows_collected": 25578,  "label": "Weather Data" },
  "part2": { "done": true,  "rows_collected": 500,    "label": "NGO Profiles" },
  "part3": { "done": true,  "rows_collected": 50033,  "label": "Donor Records" },
  "part4": { "done": true,  "rows_collected": 500,    "label": "Road Distances" },
  "part5": { "done": true,                            "label": "Validation & Packaging" }
}
```

> ✅ Crash at Part 3? Just re-run — Parts 1 & 2 are automatically skipped.

---

<div align="center">

## 🤝 CONTRIBUTING

</div>

We welcome contributions! Here's how:

```bash
# Fork → Clone → Branch → Code → PR
git checkout -b feature/your-amazing-idea
git commit -m "feat: describe your change"
git push origin feature/your-amazing-idea
# → Open a Pull Request on GitHub
```

**Areas that need help:**
- 🌆 Adding more Indian cities
- 🧪 Better NGO demand models (LSTM?)
- 📱 Mobile-first frontend dashboard
- 🌍 Extending to other countries

---

<div align="center">

## 📜 RESEARCH PAPER

</div>

> This repository accompanies a research paper currently under preparation.  
> Paper draft available at: `helpforresearchpaper/feedify/periRoute/paper/paper_draft.md`  
> LaTeX tables at: `helpforresearchpaper/feedify/feedify_results_clean/paper_ready/results_tables.tex`

**Cite this work:**
```bibtex
@misc{feedify2025,
  title   = {Feedify: An AI-Driven Food Redistribution and Waste Minimization System for Urban India},
  author  = {Dwivedi, Achintya},
  year    = {2025},
  url     = {https://github.com/achintyadwivedi09/AI-Driven-Food-Redistribution-and-Waste-Minimization-System}
}
```

---

<div align="center">

## 📬 CONTACT

<a href="https://github.com/achintyadwivedi09">
  <img src="https://img.shields.io/badge/GitHub-achintyadwivedi09-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>
&nbsp;
<a href="https://www.linkedin.com/in/dwivediachintya">
  <img src="https://img.shields.io/badge/LinkedIn-dwivediachintya-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"/>
</a>

<br/><br/>

**Built with ❤️ to fight hunger, one algorithm at a time.**

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=fadeIn" width="100%"/>

</div>
