#!/bin/bash

# Development Environment Setup Script
# This script sets up the FIU system for local development

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up FIU System Development Environment${NC}"
echo "================================================="

# Set development environment variables
export DB_HOST=localhost
export DB_PORT=6000
export DB_NAME=fiu_system_dev
export DB_USER=postgres
export DB_PASSWORD=postgres

echo -e "${YELLOW}📋 Development Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  User: $DB_USER"

# Run migration
echo -e "${YELLOW}📋 Running database migration...${NC}"
./scripts/migrate.sh

# Verify migration
echo -e "${YELLOW}📋 Verifying migration...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/22-verify-migration.sql

# Create additional test data for development
echo -e "${YELLOW}📋 Creating additional test data...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
-- Create additional test users
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('dev_super', 'dev.super@fiu.gov.et', '\$2b\$10\$example_hash', 'Dev', 'Super', 'super_admin'),
('dev_admin', 'dev.admin@fiu.gov.et', '\$2b\$10\$example_hash', 'Dev', 'Admin', 'intermediate_admin'),
('dev_encoder', 'dev.encoder@fiu.gov.et', '\$2b\$10\$example_hash', 'Dev', 'Encoder', 'data_encoder')
ON CONFLICT (username) DO NOTHING;

-- Update system settings for development
UPDATE system_settings SET setting_value = 'true' WHERE setting_key = 'debug_mode';
UPDATE system_settings SET setting_value = 'development' WHERE setting_key = 'environment';
"

echo -e "${GREEN}✅ Development environment setup completed!${NC}"
echo ""
echo -e "${BLUE}🔑 Test Credentials:${NC}"
echo "  Super Admin: dev_super / password"
echo "  Admin: dev_admin / password"
echo "  Encoder: dev_encoder / password"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "  1. Start your backend server: cd backend && npm run dev"
echo "  2. Start your frontend server: npm run dev"
echo "  3. Access the application at http://localhost:3000"
