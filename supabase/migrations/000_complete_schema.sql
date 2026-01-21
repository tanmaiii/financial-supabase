-- =============================================
-- FINANCIAL MANAGEMENT APPLICATION - COMPLETE SCHEMA
-- =============================================
-- Version: 1.0
-- Description: Complete database schema for personal financial management
-- Features: Multi-currency support, categories, accounts, transactions,
--           recurring expenses, savings goals, RLS policies
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =============================================
-- TABLE: accounts
-- Description: User's financial accounts (cash, bank, credit card, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'savings', 'investment', 'other')),
    balance DECIMAL(15, 2) DEFAULT 0 NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND' NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_account_name UNIQUE (user_id, name)
);

-- =============================================
-- TABLE: categories
-- Description: Transaction categories (income/expense)
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_category_name UNIQUE (user_id, name, type)
);

-- =============================================
-- TABLE: transactions
-- Description: Financial transactions (income/expense)
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    tags TEXT[], -- Array of tags for flexible categorization
    location VARCHAR(255),
    recurring_transaction_id UUID, -- Link to recurring transaction if auto-created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_transaction_type CHECK (
        (type = 'income' AND category_id IS NULL OR EXISTS (SELECT 1 FROM categories WHERE id = category_id AND type = 'income')) OR
        (type = 'expense' AND category_id IS NULL OR EXISTS (SELECT 1 FROM categories WHERE id = category_id AND type = 'expense'))
    )
);

-- =============================================
-- TABLE: recurring_transactions (Fixed Expenses/Income)
-- Description: Recurring financial transactions (bills, salaries, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    next_occurrence DATE NOT NULL,
    end_date DATE, -- NULL means no end date
    payment_status VARCHAR(10) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
    is_active BOOLEAN DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_recurring_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- =============================================
-- TABLE: savings_funds
-- Description: Savings goals with target amounts
-- =============================================
CREATE TABLE IF NOT EXISTS savings_funds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_saving_fund_name UNIQUE (user_id, name)
);

-- =============================================
-- TABLE: saving_contributions
-- Description: Contributions to savings funds
-- =============================================
CREATE TABLE IF NOT EXISTS saving_contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    saving_fund_id UUID NOT NULL REFERENCES savings_funds(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: budgets
-- Description: Monthly budgets by category
-- =============================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alert_threshold DECIMAL(5, 2) DEFAULT 80 CHECK (alert_threshold >= 0 AND alert_threshold <= 100), -- Percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_budget_period CHECK (period_end > period_start),
    CONSTRAINT unique_category_budget_period UNIQUE (user_id, category_id, period_start, period_end)
);

-- =============================================
-- TABLE: user_preferences
-- Description: User settings and preferences
-- =============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_currency VARCHAR(10) DEFAULT 'VND',
    locale VARCHAR(10) DEFAULT 'vi',
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    first_day_of_week INTEGER DEFAULT 1 CHECK (first_day_of_week >= 0 AND first_day_of_week <= 6),
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance optimization
-- =============================================

-- Accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_note_search ON transactions USING gin(to_tsvector('english', note));

-- Recurring transactions indexes
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_category_id ON recurring_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_occurrence ON recurring_transactions(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_payment_status ON recurring_transactions(payment_status);

-- Savings funds indexes
CREATE INDEX IF NOT EXISTS idx_savings_funds_user_id ON savings_funds(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_funds_account_id ON savings_funds(account_id);
CREATE INDEX IF NOT EXISTS idx_savings_funds_is_completed ON savings_funds(is_completed);

-- Saving contributions indexes
CREATE INDEX IF NOT EXISTS idx_saving_contributions_user_id ON saving_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_saving_contributions_fund_id ON saving_contributions(saving_fund_id);
CREATE INDEX IF NOT EXISTS idx_saving_contributions_transaction_id ON saving_contributions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_saving_contributions_date ON saving_contributions(contribution_date DESC);

-- Budgets indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period_start, period_end);

-- =============================================
-- FUNCTIONS: Auto-update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS: Auto-update timestamps
-- =============================================
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_funds_updated_at BEFORE UPDATE ON savings_funds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS: Auto-update account balance
-- =============================================
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add to account balance for income, subtract for expense
        IF NEW.account_id IS NOT NULL THEN
            IF NEW.type = 'income' THEN
                UPDATE accounts 
                SET balance = balance + NEW.amount 
                WHERE id = NEW.account_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE accounts 
                SET balance = balance - NEW.amount 
                WHERE id = NEW.account_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction
        IF OLD.account_id IS NOT NULL THEN
            IF OLD.type = 'income' THEN
                UPDATE accounts 
                SET balance = balance - OLD.amount 
                WHERE id = OLD.account_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE accounts 
                SET balance = balance + OLD.amount 
                WHERE id = OLD.account_id;
            END IF;
        END IF;
        
        -- Apply new transaction
        IF NEW.account_id IS NOT NULL THEN
            IF NEW.type = 'income' THEN
                UPDATE accounts 
                SET balance = balance + NEW.amount 
                WHERE id = NEW.account_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE accounts 
                SET balance = balance - NEW.amount 
                WHERE id = NEW.account_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the transaction
        IF OLD.account_id IS NOT NULL THEN
            IF OLD.type = 'income' THEN
                UPDATE accounts 
                SET balance = balance - OLD.amount 
                WHERE id = OLD.account_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE accounts 
                SET balance = balance + OLD.amount 
                WHERE id = OLD.account_id;
            END IF;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- =============================================
-- FUNCTIONS: Update savings fund current amount
-- =============================================
CREATE OR REPLACE FUNCTION update_savings_fund_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE savings_funds 
        SET current_amount = current_amount + NEW.amount,
            is_completed = (current_amount + NEW.amount) >= target_amount
        WHERE id = NEW.saving_fund_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE savings_funds 
        SET current_amount = GREATEST(current_amount - OLD.amount, 0),
            is_completed = (current_amount - OLD.amount) >= target_amount
        WHERE id = OLD.saving_fund_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_savings_fund_amount_trigger
    AFTER INSERT OR DELETE ON saving_contributions
    FOR EACH ROW EXECUTE FUNCTION update_savings_fund_amount();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view their own accounts"
    ON accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
    ON accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
    ON accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view their own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Recurring transactions policies
CREATE POLICY "Users can view their own recurring transactions"
    ON recurring_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
    ON recurring_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
    ON recurring_transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
    ON recurring_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Savings funds policies
CREATE POLICY "Users can view their own savings funds"
    ON savings_funds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings funds"
    ON savings_funds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings funds"
    ON savings_funds FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings funds"
    ON savings_funds FOR DELETE
    USING (auth.uid() = user_id);

-- Saving contributions policies
CREATE POLICY "Users can view their own saving contributions"
    ON saving_contributions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saving contributions"
    ON saving_contributions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saving contributions"
    ON saving_contributions FOR DELETE
    USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================
-- VIEWS: Useful aggregations
-- =============================================

-- View: Account balances summary
CREATE OR REPLACE VIEW account_balances_summary AS
SELECT 
    user_id,
    COUNT(*) as total_accounts,
    SUM(CASE WHEN is_active THEN balance ELSE 0 END) as total_balance,
    SUM(CASE WHEN type = 'cash' AND is_active THEN balance ELSE 0 END) as cash_balance,
    SUM(CASE WHEN type = 'bank' AND is_active THEN balance ELSE 0 END) as bank_balance,
    SUM(CASE WHEN type = 'credit_card' AND is_active THEN balance ELSE 0 END) as credit_balance,
    SUM(CASE WHEN type = 'savings' AND is_active THEN balance ELSE 0 END) as savings_balance
FROM accounts
GROUP BY user_id;

-- View: Monthly transaction summary
CREATE OR REPLACE VIEW monthly_transaction_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_amount,
    COUNT(*) as transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

-- View: Category spending summary
CREATE OR REPLACE VIEW category_spending_summary AS
SELECT 
    t.user_id,
    c.id as category_id,
    c.name as category_name,
    c.type as category_type,
    c.icon,
    c.color,
    COUNT(t.id) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, c.id, c.name, c.type, c.icon, c.color;

-- View: Savings progress
CREATE OR REPLACE VIEW savings_progress AS
SELECT 
    sf.*,
    CASE 
        WHEN sf.target_amount > 0 
        THEN ROUND((sf.current_amount / sf.target_amount * 100)::numeric, 2)
        ELSE 0 
    END as progress_percentage,
    CASE 
        WHEN sf.deadline IS NOT NULL 
        THEN sf.deadline - CURRENT_DATE
        ELSE NULL 
    END as days_remaining,
    (SELECT COUNT(*) FROM saving_contributions sc WHERE sc.saving_fund_id = sf.id) as contribution_count
FROM savings_funds sf;

-- =============================================
-- COMMENTS for documentation
-- =============================================
COMMENT ON TABLE accounts IS 'User financial accounts (cash, bank, credit card, etc.)';
COMMENT ON TABLE categories IS 'Transaction categories for income and expenses';
COMMENT ON TABLE transactions IS 'Financial transactions (income/expense)';
COMMENT ON TABLE recurring_transactions IS 'Recurring transactions like bills, salaries, etc.';
COMMENT ON TABLE savings_funds IS 'Savings goals with target amounts and deadlines';
COMMENT ON TABLE saving_contributions IS 'Contributions made to savings funds';
COMMENT ON TABLE budgets IS 'Monthly budgets by category';
COMMENT ON TABLE user_preferences IS 'User settings and preferences';

-- =============================================
-- END OF SCHEMA
-- =============================================
