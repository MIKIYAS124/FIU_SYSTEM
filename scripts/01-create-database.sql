-- Create the main database
CREATE DATABASE fiu_system;

-- Connect to the database
\c fiu_system;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';
