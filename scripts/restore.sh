#!/bin/bash

# FIU System Database Restore Script

set -e

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Example: $0 ./backups/fiu_system_backup_20241215_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-6000}
DB_NAME=${DB_NAME:-fiu_system}
DB_USER=${DB_USER:-postgres}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Restoring FIU System Database${NC}"
echo "================================="

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Restoring from: $BACKUP_FILE${NC}"

# Decompress and restore
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}📋 Decompressing and restoring...${NC}"
    gunzip -c "$BACKUP_FILE" | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres
else
    echo -e "${YELLOW}📋 Restoring...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -f "$BACKUP_FILE"
fi

echo -e "${GREEN}✅ Database restore completed${NC}"
