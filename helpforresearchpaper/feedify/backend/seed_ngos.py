import random
import sys
from db import supabase

CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad']

NGO_PREFIXES = ["Asha", "Seva", "Jan", "Roti", "Care", "Hope", "Food", "Annapurna", "Sanjeevani", "Smile", "Pragati"]
NGO_SUFFIXES = ["Foundation", "Trust", "Bank", "Sangam", "Mission", "Society", "Relief", "Network", "Charity"]

def seed_ngos():
    new_ngos = []
    for city in CITIES:
        # Create 5 NGOs per city
        for i in range(5):
            name = f"{random.choice(NGO_PREFIXES)} {random.choice(NGO_SUFFIXES)}"
            ngo = {
                "ngo_name": name,
                "city": city,
                "capacity_kg": float(random.randint(100, 1000)),
                "current_demand_kg": float(random.randint(50, 500)),
                "storage_type": random.choice(["cold", "dry", "both"])
            }
            new_ngos.append(ngo)
    
    print(f"Preparing to insert {len(new_ngos)} NGOs...")
    try:
        response = supabase.table("ngos").insert(new_ngos).execute()
        print(f"Successfully inserted {len(response.data)} NGOs into the database!")
    except Exception as e:
        print(f"Error seeding NGOs: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_ngos()
