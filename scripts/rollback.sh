#!/bin/bash

# FIU System Database Rollback Script
# This script will drop the database and all its contents

set -e

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-6000}
DB_NAME=${DB_NAME:-fiu_system}
DB_USER=${DB_USER:-postgres}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}⚠️  FIU System Database Rollback${NC}"
echo "=================================="
echo -e "${YELLOW}This will completely destroy the database and all data!${NC}"
echo -e "${RED}Are you sure you want to continue? (type 'YES' to confirm)${NC}"

read -r confirmation
if [ "$confirmation" != "YES" ]; then
    echo -e "${GREEN}Rollback cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}📋 Terminating active connections...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
"

echo -e "${YELLOW}📋 Dropping database...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo -e "${GREEN}✅ Database rollback completed${NC}"
