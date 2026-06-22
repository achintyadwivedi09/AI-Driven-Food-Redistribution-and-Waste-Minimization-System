import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- DONOR FUNCTIONS ---
def save_donor(data: dict) -> dict:
    result = supabase.table("donors").insert(data).execute()
    return result.data[0] if result.data else {}

def update_donor_surplus(donor_id: str, predicted_surplus: float):
    supabase.table("donors")\
        .update({"predicted_surplus": predicted_surplus})\
        .eq("donor_id", donor_id).execute()

# --- NGO FUNCTIONS ---
def get_ngos(city: str = None) -> list:
    query = supabase.table("ngos").select("*")
    if city:
        query = query.eq("city", city)
    result = query.execute()
    return result.data or []

# --- ALLOCATION FUNCTIONS ---
def store_allocation(data: dict) -> dict:
    result = supabase.table("allocations").insert(data).execute()
    return result.data[0] if result.data else {}

def get_recent_allocations(limit: int = 20) -> list:
    result = supabase.table("allocations")\
        .select("*, donors(*), ngos(*)")\
        .order("created_at", desc=True)\
        .limit(limit).execute()
    return result.data or []

# --- ANALYTICS FUNCTIONS ---
def get_latest_analytics() -> dict:
    result = supabase.table("analytics")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(1).execute()
    return result.data[0] if result.data else {}

def upsert_analytics(data: dict):
    supabase.table("analytics").insert(data).execute()
