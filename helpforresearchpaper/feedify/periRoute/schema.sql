-- PeriRoute Database Schema
-- SQLite compatible

CREATE TABLE IF NOT EXISTS donors (
    donor_id    TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    city        TEXT NOT NULL,
    lat         REAL, lon REAL,
    event_type  TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS ngos (
    ngo_id          TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    city            TEXT NOT NULL,
    lat             REAL, lon REAL,
    capacity_kg     REAL,
    storage_type    TEXT CHECK(storage_type IN
                    ('dry','cold','none')),
    priority_tier   INTEGER CHECK(priority_tier IN (1,2,3)));

CREATE TABLE IF NOT EXISTS food_batches (
    batch_id            TEXT PRIMARY KEY,
    donor_id            TEXT REFERENCES donors(donor_id),
    food_type           TEXT,
    qty_kg              REAL,
    perishability_index REAL,
    pi_decay            REAL,
    pi_final            REAL,
    time_to_expiry_hours REAL,
    temperature         REAL,
    humidity            REAL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN
        ('pending','allocated','delivered','wasted')));

CREATE TABLE IF NOT EXISTS allocations (
    alloc_id                TEXT PRIMARY KEY,
    batch_id                TEXT REFERENCES food_batches(batch_id),
    ngo_id                  TEXT REFERENCES ngos(ngo_id),
    allocated_kg            REAL,
    paps_score              REAL,
    distance_km             REAL,
    waste_kg                REAL,
    cold_chain_used         INTEGER DEFAULT 0,
    fairness_penalty_applied INTEGER DEFAULT 0,
    meals_served            REAL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP);

CREATE TABLE IF NOT EXISTS predictions (
    pred_id         TEXT PRIMARY KEY,
    model_name      TEXT,
    input_hash      TEXT,
    predicted_value REAL,
    actual_value    REAL,
    mae             REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE INDEX IF NOT EXISTS idx_alloc_ngo
    ON allocations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_alloc_batch
    ON allocations(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_status
    ON food_batches(status);
