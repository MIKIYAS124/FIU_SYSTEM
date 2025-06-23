# FIU System Database Migration Guide

This guide will help you migrate the FIU System database schema from development to production.

## 📋 Prerequisites

- PostgreSQL 12+ installed and running
- Database user with CREATE DATABASE privileges
- All SQL scripts in the `scripts/` directory

## 🚀 Quick Start

### 1. Development Setup
\`\`\`bash
# Make scripts executable
chmod +x scripts/*.sh

# Set up development environment
./scripts/setup-dev.sh
\`\`\`

### 2. Production Migration
\`\`\`bash
# Set environment variables
export DB_HOST=your-production-host
export DB_PORT=5432
export DB_NAME=fiu_system
export DB_USER=your-db-user
export DB_PASSWORD=your-secure-password

# Run migration
./scripts/migrate.sh

# Verify migration
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/22-verify-migration.sql
\`\`\`

## 📊 Migration Scripts Overview

| Script | Description |
|--------|-------------|
| `01-create-database.sql` | Creates database and extensions |
| `02-create-users-table.sql` | User authentication and roles |
| `03-create-reporting-entities-table.sql` | Financial institutions |
| `04-create-transaction-manner-table.sql` | Transaction types |
| `05-create-crime-types-table.sql` | Crime classifications |
| `06-create-branches-table.sql` | Institution branches |
| `07-create-str-reports-table.sql` | Suspicious Transaction Reports |
| `08-create-ctr-reports-table.sql` | Currency Transaction Reports |
| `09-create-report-attachments-table.sql` | File attachments |
| `10-create-audit-logs-table.sql` | System audit trail |
| `11-create-system-settings-table.sql` | Configuration settings |
| `12-create-user-sessions-table.sql` | Session management |
| `13-create-notifications-table.sql` | System notifications |
| `14-insert-initial-data.sql` | Default system data |
| `15-create-views.sql` | Database views |
| `16-create-functions.sql` | Stored procedures |
| `17-create-triggers.sql` | Database triggers |
| `18-create-indexes-performance.sql` | Performance indexes |
| `19-grant-permissions.sql` | User permissions |
| `20-create-sample-data.sql` | Sample data for testing |
| `21-create-workflow-history-table.sql` | Report workflow tracking |
| `22-verify-migration.sql` | Migration verification |

## 🔧 Environment Variables

\`\`\`bash
# Database Connection
DB_HOST=localhost          # Database host
DB_PORT=5432              # Database port
DB_NAME=fiu_system        # Database name
DB_USER=postgres          # Database user
DB_PASSWORD=your_password # Database password

# Backup Configuration
BACKUP_DIR=./backups      # Backup directory
\`\`\`

## 💾 Backup and Restore

### Create Backup
\`\`\`bash
./scripts/backup.sh
\`\`\`

### Restore from Backup
\`\`\`bash
./scripts/restore.sh ./backups/fiu_system_backup_20241215_120000.sql.gz
\`\`\`

## 🔄 Rollback

⚠️ **WARNING**: This will completely destroy the database!

\`\`\`bash
./scripts/rollback.sh
\`\`\`

## 🧪 Testing Migration

After migration, verify everything is working:

\`\`\`bash
# Run verification script
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/22-verify-migration.sql

# Check table counts
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT schemaname, tablename, n_tup_ins as rows 
FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"
\`\`\`

## 🔐 Security Considerations

1. **Database User**: Create a dedicated user for the application
2. **Passwords**: Use strong, unique passwords
3. **Network**: Restrict database access to application servers only
4. **SSL**: Enable SSL connections in production
5. **Backups**: Encrypt backup files

## 📈 Performance Optimization

The migration includes:
- ✅ Optimized indexes for all foreign keys
- ✅ Composite indexes for common queries
- ✅ Proper data types for performance
- ✅ Partitioning ready for large tables
- ✅ Connection pooling configuration

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**
   \`\`\`bash
   # Fix script permissions
   chmod +x scripts/*.sh
   \`\`\`

2. **Database Connection Failed**
   \`\`\`bash
   # Check PostgreSQL status
   pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
   \`\`\`

3. **Migration Failed**
   \`\`\`bash
   # Check logs and run verification
   ./scripts/rollback.sh
   ./scripts/migrate.sh
   \`\`\`

## 📞 Support

If you encounter issues during migration:
1. Check the PostgreSQL logs
2. Verify all environment variables
3. Ensure PostgreSQL version compatibility
4. Review the verification script output

## 🎯 Next Steps

After successful migration:
1. Configure your backend application
2. Set up connection pooling
3. Configure monitoring and alerting
4. Set up automated backups
5. Test all application functionality
