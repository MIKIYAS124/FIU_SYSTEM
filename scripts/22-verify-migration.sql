-- Verification script to check if all tables and data are properly created
-- Run this after migration to verify everything is working

\echo '🔍 Verifying FIU System Database Migration...'
\echo '=============================================='

-- Check if all required tables exist
\echo '📋 Checking table existence...'
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'users', 'reporting_entities', 'transaction_manner', 'crime_types',
            'branches', 'str_reports', 'ctr_reports', 'report_attachments',
            'audit_logs', 'system_settings', 'user_sessions', 'notifications',
            'workflow_history'
        ) THEN '✅ Required'
        ELSE '⚠️  Optional'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

\echo ''
\echo '📊 Table row counts...'
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '🔐 Checking user roles...'
SELECT 
    username,
    role,
    is_active,
    created_at
FROM users
ORDER BY role, username;

\echo ''
\echo '🏢 Checking reporting entities...'
SELECT 
    entity_name,
    business_type,
    country,
    status
FROM reporting_entities
ORDER BY entity_name;

\echo ''
\echo '🔧 Checking system settings...'
SELECT 
    setting_key,
    setting_value,
    setting_type,
    is_public
FROM system_settings
ORDER BY setting_key;

\echo ''
\echo '📈 Checking indexes...'
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '🔍 Checking foreign key constraints...'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''
\echo '✅ Migration verification completed!'
\echo 'If you see any errors above, please check the migration logs.'
