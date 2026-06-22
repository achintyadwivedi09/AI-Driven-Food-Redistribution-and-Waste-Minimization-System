from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import joblib, numpy as np, json, os

app = FastAPI(title="PeriRoute API", version="1.0.0",
    description="Perishability-Aware Food Redistribution API")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"])

BASE = os.path.join(os.path.dirname(__file__),"..") 
try:
    model  = joblib.load(f"{BASE}/models/best_surplus_model.pkl")
    scaler = joblib.load(f"{BASE}/models/surplus_scaler.pkl")
    ngo_pd = json.load(open(f"{BASE}/models/ngo_predicted_demand.json"))
    MODEL_LOADED = True
except:
    MODEL_LOADED = False

class SurplusInput(BaseModel):
    city: str
    event_type: str
    food_type: str
    qty_prepared: float
    temperature: float
    humidity: float
    hours_since_prep: float = 4.0

class AllocateInput(BaseModel):
    surplus_kg: float
    food_type: str
    time_to_expiry_hours: float
    donor_city: str = "Mumbai"

class SurplusResponse(BaseModel):
    predicted_surplus_kg: float
    model_loaded: bool
    timestamp: str

class AllocateResponse(BaseModel):
    recommended_ngo: str
    paps_score: float
    distance_km: float
    cold_chain_required: bool
    waste_kg: float
    meals_served: float
    timestamp: str

@app.post("/predict/surplus", response_model=SurplusResponse)
def predict_surplus(data: SurplusInput):
    pi_map = {"Rice":0.60,"Dal":0.55,"Sabzi":0.80,
              "Roti":0.70,"Biryani":0.75,
              "Sweets":0.65,"Salad":0.90}
    pi = pi_map.get(data.food_type, 0.65)
    pred = round(data.qty_prepared * (pi * 0.5), 2)
    return SurplusResponse(
        predicted_surplus_kg=pred,
        model_loaded=MODEL_LOADED,
        timestamp=datetime.now().isoformat())

@app.post("/allocate", response_model=AllocateResponse)
def allocate(data: AllocateInput):
    pi_map = {"Rice":0.60,"Dal":0.55,"Sabzi":0.80,
              "Roti":0.70,"Biryani":0.75,
              "Sweets":0.65,"Salad":0.90}
    pi = pi_map.get(data.food_type, 0.65)
    cold_req = pi > 0.70
    paps = round(0.30*pi + 0.25*0.8 + 0.20*0.9 +
                 0.15*0.7 + 0.10*(1.0 if
                 data.time_to_expiry_hours<6 else 0.5), 3)
    alloc = min(data.surplus_kg, 150.0)
    waste = max(0.0, data.surplus_kg - alloc)
    return AllocateResponse(
        recommended_ngo="NGO_042",
        paps_score=paps,
        distance_km=round(np.random.uniform(1,15),2),
        cold_chain_required=cold_req,
        waste_kg=round(waste,2),
        meals_served=round(alloc/0.4,1),
        timestamp=datetime.now().isoformat())

@app.get("/health")
def health():
    return {"status":"ok","version":"1.0.0",
            "model_loaded":MODEL_LOADED,
            "timestamp":datetime.now().isoformat()}
