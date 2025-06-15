-- Create roles and grant permissions

-- Create application roles
CREATE ROLE fiu_app_user;
CREATE ROLE fiu_read_only;
CREATE ROLE fiu_admin;

-- Grant basic permissions to application user
GRANT CONNECT ON DATABASE fiu_system TO fiu_app_user;
GRANT USAGE ON SCHEMA public TO fiu_app_user;

-- Grant table permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fiu_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fiu_app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fiu_app_user;

-- Grant read-only permissions
GRANT CONNECT ON DATABASE fiu_system TO fiu_read_only;
GRANT USAGE ON SCHEMA public TO fiu_read_only;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO fiu_read_only;

-- Grant admin permissions
GRANT ALL PRIVILEGES ON DATABASE fiu_system TO fiu_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fiu_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fiu_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO fiu_admin;

-- Create specific application user
-- CREATE USER fiu_api_user WITH PASSWORD 'your_secure_password_here';
-- GRANT fiu_app_user TO fiu_api_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fiu_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO fiu_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO fiu_app_user;
