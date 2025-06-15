#!/bin/bash

# FIU System Database Backup Script

set -e

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-6000}
DB_NAME=${DB_NAME:-fiu_system}
DB_USER=${DB_USER:-postgres}

# Backup configuration
BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/fiu_system_backup_$TIMESTAMP.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}💾 Creating FIU System Database Backup${NC}"
echo "======================================"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📋 Creating backup: $BACKUP_FILE${NC}"

# Create backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --verbose \
    --clean \
    --create \
    --if-exists \
    --format=plain \
    --file="$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}📋 Compressing backup...${NC}"
gzip "$BACKUP_FILE"

echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}.gz${NC}"
echo -e "${BLUE}📊 Backup size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)${NC}"
