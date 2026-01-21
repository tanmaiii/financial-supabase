-- =============================================
-- APPLY ALL MIGRATIONS
-- =============================================
-- File này sẽ apply tất cả migrations theo thứ tự
-- Run file này để setup hoàn chỉnh database
-- =============================================

\echo '=================================='
\echo 'Starting Database Migration...'
\echo '=================================='

\echo '\n[1/3] Applying Complete Schema...'
\i 000_complete_schema.sql

\echo '\n[2/3] Applying Seed Data and Functions...'
\i 001_seed_data.sql

\echo '\n[3/3] Applying Backup Utilities...'
\i 002_backup_utilities.sql

\echo '\n=================================='
\echo 'Migration Completed Successfully!'
\echo '=================================='

-- Show summary
\echo '\nDatabase Summary:'
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    AND tablename IN (
        'accounts',
        'categories', 
        'transactions',
        'recurring_transactions',
        'savings_funds',
        'saving_contributions',
        'budgets',
        'user_preferences'
    )
ORDER BY tablename;
