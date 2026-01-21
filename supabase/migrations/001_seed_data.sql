-- =============================================
-- FINANCIAL MANAGEMENT APPLICATION - SEED DATA
-- =============================================
-- Version: 1.0
-- Description: Initial seed data for development and testing
-- =============================================

-- =============================================
-- NOTE: This file should be run AFTER 000_complete_schema.sql
-- =============================================

-- =============================================
-- FUNCTION: Initialize new user with default data
-- =============================================
CREATE OR REPLACE FUNCTION initialize_new_user(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_cash_account_id UUID;
    v_bank_account_id UUID;
    v_credit_account_id UUID;
BEGIN
    -- Create default accounts
    INSERT INTO accounts (user_id, name, type, balance, currency, icon, color)
    VALUES 
        (p_user_id, 'Cash', 'cash', 0, 'VND', '💵', '#10b981'),
        (p_user_id, 'Bank Account', 'bank', 0, 'VND', '🏦', '#3b82f6'),
        (p_user_id, 'Credit Card', 'credit_card', 0, 'VND', '💳', '#ef4444')
    RETURNING id INTO v_cash_account_id;

    -- Create default income categories
    INSERT INTO categories (user_id, name, type, icon, color)
    VALUES 
        (p_user_id, 'Salary', 'income', '💼', '#10b981'),
        (p_user_id, 'Freelance', 'income', '💻', '#3b82f6'),
        (p_user_id, 'Investment', 'income', '📈', '#8b5cf6'),
        (p_user_id, 'Gift', 'income', '🎁', '#ec4899'),
        (p_user_id, 'Other Income', 'income', '💰', '#06b6d4');

    -- Create default expense categories
    INSERT INTO categories (user_id, name, type, icon, color)
    VALUES 
        (p_user_id, 'Food & Dining', 'expense', '🍔', '#f59e0b'),
        (p_user_id, 'Transportation', 'expense', '🚗', '#ef4444'),
        (p_user_id, 'Shopping', 'expense', '🛍️', '#ec4899'),
        (p_user_id, 'Entertainment', 'expense', '🎬', '#8b5cf6'),
        (p_user_id, 'Bills & Utilities', 'expense', '📄', '#06b6d4'),
        (p_user_id, 'Healthcare', 'expense', '🏥', '#10b981'),
        (p_user_id, 'Education', 'expense', '📚', '#3b82f6'),
        (p_user_id, 'Housing', 'expense', '🏠', '#6366f1'),
        (p_user_id, 'Other Expense', 'expense', '💸', '#64748b');

    -- Create default user preferences
    INSERT INTO user_preferences (user_id, default_currency, locale, theme, date_format)
    VALUES (p_user_id, 'VND', 'vi', 'light', 'DD/MM/YYYY')
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Successfully initialized user: %', p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Auto-initialize new users
-- =============================================
CREATE OR REPLACE FUNCTION auto_initialize_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize user với default data
    PERFORM initialize_new_user(NEW.id);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to initialize user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Uncomment the following lines if you want to auto-initialize users on signup
-- This trigger will run when a new user is created in auth.users
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION auto_initialize_user();

-- =============================================
-- SAMPLE DATA (for development/testing only)
-- =============================================

-- Note: Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users
-- This is just example data structure, not meant to be run directly

/*
-- Example: Initialize a test user
DO $$
DECLARE
    test_user_id UUID := 'YOUR_USER_ID_HERE';
    salary_category_id UUID;
    food_category_id UUID;
    cash_account_id UUID;
BEGIN
    -- Initialize user with defaults
    PERFORM initialize_new_user(test_user_id);
    
    -- Get category IDs
    SELECT id INTO salary_category_id FROM categories WHERE user_id = test_user_id AND name = 'Salary' LIMIT 1;
    SELECT id INTO food_category_id FROM categories WHERE user_id = test_user_id AND name = 'Food & Dining' LIMIT 1;
    SELECT id INTO cash_account_id FROM accounts WHERE user_id = test_user_id AND name = 'Cash' LIMIT 1;
    
    -- Add sample transactions
    INSERT INTO transactions (user_id, account_id, category_id, amount, type, transaction_date, note)
    VALUES 
        (test_user_id, cash_account_id, salary_category_id, 20000000, 'income', CURRENT_DATE - INTERVAL '5 days', 'Monthly salary'),
        (test_user_id, cash_account_id, food_category_id, 150000, 'expense', CURRENT_DATE - INTERVAL '3 days', 'Lunch'),
        (test_user_id, cash_account_id, food_category_id, 200000, 'expense', CURRENT_DATE - INTERVAL '2 days', 'Dinner with friends'),
        (test_user_id, cash_account_id, food_category_id, 80000, 'expense', CURRENT_DATE - INTERVAL '1 day', 'Coffee');
    
    -- Add sample recurring transaction
    INSERT INTO recurring_transactions (user_id, name, amount, type, category_id, account_id, frequency, start_date, next_occurrence, note)
    VALUES 
        (test_user_id, 'Monthly Rent', 5000000, 'expense', food_category_id, cash_account_id, 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 'Apartment rent');
    
    -- Add sample savings fund
    INSERT INTO savings_funds (user_id, name, target_amount, current_amount, deadline, account_id, icon, color, description)
    VALUES 
        (test_user_id, 'Emergency Fund', 50000000, 10000000, CURRENT_DATE + INTERVAL '12 months', cash_account_id, '🚨', '#ef4444', 'Emergency fund for unexpected expenses');
    
    RAISE NOTICE 'Sample data created successfully';
END $$;
*/

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function: Get account balance summary for a user
CREATE OR REPLACE FUNCTION get_account_summary(p_user_id UUID)
RETURNS TABLE (
    account_name VARCHAR,
    account_type VARCHAR,
    balance DECIMAL,
    currency VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.name, a.type, a.balance, a.currency
    FROM accounts a
    WHERE a.user_id = p_user_id AND a.is_active = TRUE
    ORDER BY a.balance DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get monthly spending by category
CREATE OR REPLACE FUNCTION get_monthly_spending(p_user_id UUID, p_month DATE)
RETURNS TABLE (
    category_name VARCHAR,
    category_icon VARCHAR,
    category_color VARCHAR,
    total_amount DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.name,
        c.icon,
        c.color,
        SUM(t.amount)::DECIMAL,
        COUNT(t.id)
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id 
        AND t.type = 'expense'
        AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', p_month)
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY SUM(t.amount) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get savings progress
CREATE OR REPLACE FUNCTION get_savings_progress(p_user_id UUID)
RETURNS TABLE (
    fund_name VARCHAR,
    target_amount DECIMAL,
    current_amount DECIMAL,
    progress_percentage NUMERIC,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sf.name,
        sf.target_amount,
        sf.current_amount,
        ROUND((sf.current_amount / NULLIF(sf.target_amount, 0) * 100)::NUMERIC, 2),
        CASE 
            WHEN sf.deadline IS NOT NULL 
            THEN (sf.deadline - CURRENT_DATE)::INTEGER
            ELSE NULL 
        END
    FROM savings_funds sf
    WHERE sf.user_id = p_user_id AND sf.is_completed = FALSE
    ORDER BY sf.deadline ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function: Get upcoming recurring transactions
CREATE OR REPLACE FUNCTION get_upcoming_recurring(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    transaction_name VARCHAR,
    amount DECIMAL,
    type VARCHAR,
    next_date DATE,
    days_until INTEGER,
    payment_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rt.name,
        rt.amount,
        rt.type,
        rt.next_occurrence,
        (rt.next_occurrence - CURRENT_DATE)::INTEGER,
        rt.payment_status
    FROM recurring_transactions rt
    WHERE rt.user_id = p_user_id 
        AND rt.is_active = TRUE
        AND rt.next_occurrence <= CURRENT_DATE + p_days
    ORDER BY rt.next_occurrence ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MAINTENANCE FUNCTIONS
-- =============================================

-- Function: Clean up old deleted data (soft delete scenario)
CREATE OR REPLACE FUNCTION cleanup_old_data(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- This is a template - adjust based on your soft delete implementation
    -- For now, just return 0 as we're using hard deletes
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Recalculate account balances (for data integrity)
CREATE OR REPLACE FUNCTION recalculate_account_balances(p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    account_record RECORD;
    calculated_balance DECIMAL;
BEGIN
    FOR account_record IN 
        SELECT id FROM accounts WHERE (p_user_id IS NULL OR user_id = p_user_id)
    LOOP
        -- Calculate balance from transactions
        SELECT 
            COALESCE(SUM(CASE 
                WHEN type = 'income' THEN amount 
                WHEN type = 'expense' THEN -amount 
                ELSE 0 
            END), 0)
        INTO calculated_balance
        FROM transactions
        WHERE account_id = account_record.id;
        
        -- Update account balance
        UPDATE accounts 
        SET balance = calculated_balance
        WHERE id = account_record.id;
    END LOOP;
    
    RAISE NOTICE 'Account balances recalculated successfully';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON FUNCTION initialize_new_user IS 'Initialize a new user with default categories, accounts, and preferences';
COMMENT ON FUNCTION get_account_summary IS 'Get account balance summary for a user';
COMMENT ON FUNCTION get_monthly_spending IS 'Get monthly spending breakdown by category';
COMMENT ON FUNCTION get_savings_progress IS 'Get savings goals progress for a user';
COMMENT ON FUNCTION get_upcoming_recurring IS 'Get upcoming recurring transactions';
COMMENT ON FUNCTION recalculate_account_balances IS 'Recalculate account balances from transaction history';

-- =============================================
-- END OF SEED DATA
-- =============================================
