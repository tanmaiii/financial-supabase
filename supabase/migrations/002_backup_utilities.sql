-- =============================================
-- BACKUP AND RESTORE UTILITIES
-- =============================================
-- Version: 1.0
-- Description: Utilities for backing up and restoring user data
-- =============================================

-- =============================================
-- BACKUP FUNCTIONS
-- =============================================

-- Function: Export user data to JSON format
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_id', p_user_id,
        'export_date', NOW(),
        'accounts', (
            SELECT json_agg(row_to_json(a))
            FROM accounts a
            WHERE a.user_id = p_user_id
        ),
        'categories', (
            SELECT json_agg(row_to_json(c))
            FROM categories c
            WHERE c.user_id = p_user_id
        ),
        'transactions', (
            SELECT json_agg(row_to_json(t))
            FROM transactions t
            WHERE t.user_id = p_user_id
        ),
        'recurring_transactions', (
            SELECT json_agg(row_to_json(rt))
            FROM recurring_transactions rt
            WHERE rt.user_id = p_user_id
        ),
        'savings_funds', (
            SELECT json_agg(row_to_json(sf))
            FROM savings_funds sf
            WHERE sf.user_id = p_user_id
        ),
        'saving_contributions', (
            SELECT json_agg(row_to_json(sc))
            FROM saving_contributions sc
            WHERE sc.user_id = p_user_id
        ),
        'budgets', (
            SELECT json_agg(row_to_json(b))
            FROM budgets b
            WHERE b.user_id = p_user_id
        ),
        'preferences', (
            SELECT row_to_json(up)
            FROM user_preferences up
            WHERE up.user_id = p_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create a backup snapshot
CREATE OR REPLACE FUNCTION create_backup_snapshot(p_user_id UUID)
RETURNS TABLE (
    backup_data JSON,
    record_counts JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        export_user_data(p_user_id) as backup_data,
        json_build_object(
            'accounts', (SELECT COUNT(*) FROM accounts WHERE user_id = p_user_id),
            'categories', (SELECT COUNT(*) FROM categories WHERE user_id = p_user_id),
            'transactions', (SELECT COUNT(*) FROM transactions WHERE user_id = p_user_id),
            'recurring_transactions', (SELECT COUNT(*) FROM recurring_transactions WHERE user_id = p_user_id),
            'savings_funds', (SELECT COUNT(*) FROM savings_funds WHERE user_id = p_user_id),
            'saving_contributions', (SELECT COUNT(*) FROM saving_contributions WHERE user_id = p_user_id),
            'budgets', (SELECT COUNT(*) FROM budgets WHERE user_id = p_user_id)
        ) as record_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DATA VALIDATION FUNCTIONS
-- =============================================

-- Function: Validate user data integrity
CREATE OR REPLACE FUNCTION validate_user_data(p_user_id UUID)
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check for orphaned transactions (without category or account)
    RETURN QUERY
    SELECT 
        'Orphaned Transactions'::TEXT,
        CASE 
            WHEN COUNT(*) > 0 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END,
        COUNT(*)::TEXT || ' transactions without category or account'
    FROM transactions
    WHERE user_id = p_user_id 
        AND (category_id IS NULL OR account_id IS NULL);

    -- Check for negative account balances (excluding credit cards)
    RETURN QUERY
    SELECT 
        'Negative Balances'::TEXT,
        CASE 
            WHEN COUNT(*) > 0 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END,
        COUNT(*)::TEXT || ' accounts with negative balance'
    FROM accounts
    WHERE user_id = p_user_id 
        AND type != 'credit_card'
        AND balance < 0;

    -- Check for inactive categories still in use
    RETURN QUERY
    SELECT 
        'Inactive Categories In Use'::TEXT,
        CASE 
            WHEN COUNT(DISTINCT t.category_id) > 0 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END,
        COUNT(DISTINCT t.category_id)::TEXT || ' inactive categories still have transactions'
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id 
        AND c.is_active = FALSE;

    -- Check for past recurring transactions not updated
    RETURN QUERY
    SELECT 
        'Overdue Recurring Transactions'::TEXT,
        CASE 
            WHEN COUNT(*) > 0 THEN 'INFO'::TEXT
            ELSE 'OK'::TEXT
        END,
        COUNT(*)::TEXT || ' recurring transactions past due date'
    FROM recurring_transactions
    WHERE user_id = p_user_id 
        AND is_active = TRUE
        AND next_occurrence < CURRENT_DATE
        AND payment_status = 'unpaid';

    -- Check for completed savings goals
    RETURN QUERY
    SELECT 
        'Completed Savings Goals'::TEXT,
        CASE 
            WHEN COUNT(*) > 0 THEN 'INFO'::TEXT
            ELSE 'OK'::TEXT
        END,
        COUNT(*)::TEXT || ' savings goals reached target'
    FROM savings_funds
    WHERE user_id = p_user_id 
        AND current_amount >= target_amount
        AND is_completed = FALSE;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STATISTICS FUNCTIONS
-- =============================================

-- Function: Get comprehensive user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_accounts', (
            SELECT COUNT(*) FROM accounts WHERE user_id = p_user_id AND is_active = TRUE
        ),
        'total_balance', (
            SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE user_id = p_user_id AND is_active = TRUE
        ),
        'total_categories', (
            SELECT COUNT(*) FROM categories WHERE user_id = p_user_id AND is_active = TRUE
        ),
        'total_transactions', (
            SELECT COUNT(*) FROM transactions WHERE user_id = p_user_id
        ),
        'total_income', (
            SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = p_user_id AND type = 'income'
        ),
        'total_expense', (
            SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = p_user_id AND type = 'expense'
        ),
        'net_worth', (
            SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
            FROM transactions WHERE user_id = p_user_id
        ),
        'active_recurring', (
            SELECT COUNT(*) FROM recurring_transactions WHERE user_id = p_user_id AND is_active = TRUE
        ),
        'active_savings_goals', (
            SELECT COUNT(*) FROM savings_funds WHERE user_id = p_user_id AND is_completed = FALSE
        ),
        'total_savings', (
            SELECT COALESCE(SUM(current_amount), 0) FROM savings_funds WHERE user_id = p_user_id
        ),
        'this_month_income', (
            SELECT COALESCE(SUM(amount), 0) 
            FROM transactions 
            WHERE user_id = p_user_id 
                AND type = 'income'
                AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        'this_month_expense', (
            SELECT COALESCE(SUM(amount), 0) 
            FROM transactions 
            WHERE user_id = p_user_id 
                AND type = 'expense'
                AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        'last_transaction_date', (
            SELECT MAX(transaction_date) FROM transactions WHERE user_id = p_user_id
        ),
        'account_created', (
            SELECT created_at FROM user_preferences WHERE user_id = p_user_id
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DATA CLEANUP FUNCTIONS
-- =============================================

-- Function: Archive old transactions (move to archive table)
-- Note: You need to create an 'archived_transactions' table first
/*
CREATE TABLE IF NOT EXISTS archived_transactions (
    LIKE transactions INCLUDING ALL
);
*/

CREATE OR REPLACE FUNCTION archive_old_transactions(
    p_user_id UUID, 
    p_older_than_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- This is a template function
    -- Uncomment and modify if you create an archive table
    
    /*
    WITH moved_transactions AS (
        INSERT INTO archived_transactions
        SELECT * FROM transactions
        WHERE user_id = p_user_id
            AND transaction_date < CURRENT_DATE - p_older_than_days
        RETURNING id
    )
    DELETE FROM transactions
    WHERE id IN (SELECT id FROM moved_transactions);
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    */
    
    archived_count := 0;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete duplicate transactions
CREATE OR REPLACE FUNCTION remove_duplicate_transactions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH duplicates AS (
        SELECT id,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, account_id, category_id, amount, type, transaction_date, note
                ORDER BY created_at
            ) as rn
        FROM transactions
        WHERE user_id = p_user_id
    )
    DELETE FROM transactions
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % duplicate transactions for user %', deleted_count, p_user_id;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUDIT FUNCTIONS
-- =============================================

-- Function: Get audit trail for user actions
CREATE OR REPLACE FUNCTION get_recent_activity(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    activity_date TIMESTAMP WITH TIME ZONE,
    activity_type TEXT,
    description TEXT,
    amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH all_activities AS (
        SELECT created_at, 'Transaction Created' as type, 
               note as description, amount
        FROM transactions
        WHERE user_id = p_user_id
        
        UNION ALL
        
        SELECT created_at, 'Account Created' as type,
               'Created account: ' || name as description, balance
        FROM accounts
        WHERE user_id = p_user_id
        
        UNION ALL
        
        SELECT created_at, 'Category Created' as type,
               'Created category: ' || name as description, NULL::DECIMAL
        FROM categories
        WHERE user_id = p_user_id
        
        UNION ALL
        
        SELECT created_at, 'Savings Fund Created' as type,
               'Created savings goal: ' || name as description, target_amount
        FROM savings_funds
        WHERE user_id = p_user_id
        
        UNION ALL
        
        SELECT created_at, 'Contribution Made' as type,
               note as description, amount
        FROM saving_contributions
        WHERE user_id = p_user_id
    )
    SELECT * FROM all_activities
    ORDER BY activity_date DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRATION HELPERS
-- =============================================

-- Function: Migrate data from old schema (template)
CREATE OR REPLACE FUNCTION migrate_from_old_schema(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This is a template function for future migrations
    -- Modify based on your specific migration needs
    
    RAISE NOTICE 'Migration function - implement based on your needs';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TESTING HELPERS
-- =============================================

-- Function: Generate sample data for testing
CREATE OR REPLACE FUNCTION generate_sample_data(
    p_user_id UUID,
    p_num_transactions INTEGER DEFAULT 100
)
RETURNS BOOLEAN AS $$
DECLARE
    i INTEGER;
    random_account UUID;
    random_category UUID;
    random_amount DECIMAL;
    random_type TEXT;
BEGIN
    -- Get random account and category
    FOR i IN 1..p_num_transactions LOOP
        -- Random type
        random_type := CASE WHEN random() < 0.5 THEN 'income' ELSE 'expense' END;
        
        -- Get random account
        SELECT id INTO random_account 
        FROM accounts 
        WHERE user_id = p_user_id 
        ORDER BY random() 
        LIMIT 1;
        
        -- Get random category of the same type
        SELECT id INTO random_category 
        FROM categories 
        WHERE user_id = p_user_id AND type = random_type
        ORDER BY random() 
        LIMIT 1;
        
        -- Random amount between 10,000 and 1,000,000
        random_amount := (random() * 990000 + 10000)::DECIMAL(15,2);
        
        -- Insert transaction
        INSERT INTO transactions (
            user_id, account_id, category_id, amount, type, 
            transaction_date, note
        ) VALUES (
            p_user_id, random_account, random_category, random_amount, random_type,
            CURRENT_DATE - (random() * 365)::INTEGER,
            'Sample transaction #' || i
        );
    END LOOP;
    
    RAISE NOTICE 'Generated % sample transactions for user %', p_num_transactions, p_user_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON FUNCTION export_user_data IS 'Export all user data as JSON for backup';
COMMENT ON FUNCTION create_backup_snapshot IS 'Create a complete backup snapshot with record counts';
COMMENT ON FUNCTION validate_user_data IS 'Validate user data integrity and return warnings';
COMMENT ON FUNCTION get_user_statistics IS 'Get comprehensive statistics for a user';
COMMENT ON FUNCTION remove_duplicate_transactions IS 'Remove duplicate transactions for a user';
COMMENT ON FUNCTION get_recent_activity IS 'Get recent activity log for a user';
COMMENT ON FUNCTION generate_sample_data IS 'Generate sample transactions for testing';

-- =============================================
-- USAGE EXAMPLES
-- =============================================

/*
-- Export user data
SELECT export_user_data('user-uuid-here');

-- Create backup
SELECT * FROM create_backup_snapshot('user-uuid-here');

-- Validate data
SELECT * FROM validate_user_data('user-uuid-here');

-- Get statistics
SELECT get_user_statistics('user-uuid-here');

-- Remove duplicates
SELECT remove_duplicate_transactions('user-uuid-here');

-- Get recent activity
SELECT * FROM get_recent_activity('user-uuid-here', 100);

-- Generate test data
SELECT generate_sample_data('user-uuid-here', 200);
*/

-- =============================================
-- END OF BACKUP UTILITIES
-- =============================================
