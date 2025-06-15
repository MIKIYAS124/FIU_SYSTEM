#!/bin/bash

# FIU System Database Migration Script
# This script will create the database and run all migration scripts in order

set -e  # Exit on any error

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-6000}
DB_NAME=${DB_NAME:-fiu_system}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-12345678}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting FIU System Database Migration${NC}"
echo "=================================="

# Check if PostgreSQL is running
echo -e "${YELLOW}📋 Checking PostgreSQL connection...${NC}"
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo -e "${RED}❌ PostgreSQL is not running or not accessible${NC}"
    echo "Please ensure PostgreSQL is running and accessible with the provided credentials"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL connection successful${NC}"

# Create database if it doesn't exist
echo -e "${YELLOW}📋 Creating database if not exists...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"

# Function to run SQL script
run_sql_script() {
    local script_file=$1
    local script_name=$(basename "$script_file")
    
    echo -e "${YELLOW}📋 Running $script_name...${NC}"
    
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$script_file"; then
        echo -e "${GREEN}✅ $script_name completed successfully${NC}"
    else
        echo -e "${RED}❌ $script_name failed${NC}"
        exit 1
    fi
}

# Run migration scripts in order
echo -e "${BLUE}📊 Running migration scripts...${NC}"

# Core database setup
run_sql_script "scripts/01-create-database.sql"
run_sql_script "scripts/02-create-users-table.sql"
run_sql_script "scripts/03-create-reporting-entities-table.sql"
run_sql_script "scripts/04-create-transaction-manner-table.sql"
run_sql_script "scripts/05-create-crime-types-table.sql"
run_sql_script "scripts/06-create-branches-table.sql"

# Report tables
run_sql_script "scripts/07-create-str-reports-table.sql"
run_sql_script "scripts/08-create-ctr-reports-table.sql"
run_sql_script "scripts/09-create-report-attachments-table.sql"

# System tables
run_sql_script "scripts/10-create-audit-logs-table.sql"
run_sql_script "scripts/11-create-system-settings-table.sql"
run_sql_script "scripts/12-create-user-sessions-table.sql"
run_sql_script "scripts/13-create-notifications-table.sql"
run_sql_script "scripts/21-create-workflow-history-table.sql"

# Data and configuration
run_sql_script "scripts/14-insert-initial-data.sql"
run_sql_script "scripts/15-create-views.sql"
run_sql_script "scripts/16-create-functions.sql"
run_sql_script "scripts/17-create-triggers.sql"
run_sql_script "scripts/18-create-indexes-performance.sql"
run_sql_script "scripts/19-grant-permissions.sql"
run_sql_script "scripts/20-create-sample-data.sql"

echo -e "${GREEN}🎉 Database migration completed successfully!${NC}"
echo "=================================="
echo -e "${BLUE}📊 Database Statistics:${NC}"

# Get database statistics
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
ORDER BY schemaname, tablename;
"

echo -e "${GREEN}✅ FIU System database is ready for use!${NC}"
