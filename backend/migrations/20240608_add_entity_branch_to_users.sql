-- Migration: Add entity_id and branch_id to users table
ALTER TABLE users ADD entity_id INTEGER REFERENCES reporting_entities(id);
ALTER TABLE users ADD branch_id INTEGER REFERENCES branches(id); 