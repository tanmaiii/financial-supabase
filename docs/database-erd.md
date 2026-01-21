# Entity Relationship Diagram (ERD)

## Visual Database Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FINANCIAL MANAGEMENT SYSTEM                         │
│                              Database ERD v1.0                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   auth.users     │
                              │   (Supabase)     │
                              │                  │
                              │  PK: id (UUID)   │
                              │      email       │
                              │      ...         │
                              └────────┬─────────┘
                                       │
                                       │ user_id (FK)
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
                ▼                                             ▼
    ┌────────────────────┐                         ┌────────────────────┐
    │     accounts       │                         │    categories      │
    ├────────────────────┤                         ├────────────────────┤
    │ PK: id            │◄───────┐                │ PK: id             │
    │ FK: user_id       │        │                │ FK: user_id        │
    │     name          │        │                │     name           │
    │     type          │        │                │     type           │
    │     balance       │        │                │     icon           │
    │     currency      │        │                │     color          │
    │     icon          │        │                │     is_active      │
    │     color         │        │                └──────────┬─────────┘
    │     is_active     │        │                           │
    └────────┬───────────┘        │                           │
             │                    │                           │
             │ account_id (FK)    │ account_id (FK)           │ category_id (FK)
             │                    │                           │
             │         ┌──────────┴───────────────────────────┴─────────┐
             │         │                                                │
             │         │                                                │
             │         ▼                                                ▼
             │  ┌──────────────────────────────┐           ┌──────────────────────────────┐
             │  │      transactions            │           │  recurring_transactions      │
             │  ├──────────────────────────────┤           ├──────────────────────────────┤
             │  │ PK: id                       │           │ PK: id                       │
             │  │ FK: user_id                  │           │ FK: user_id                  │
             │  │ FK: account_id               │           │ FK: category_id (NOT NULL)   │
             │  │ FK: category_id              │           │ FK: account_id               │
             │  │     amount                   │           │     name                     │
             │  │     type (income/expense)    │           │     amount                   │
             │  │     transaction_date         │           │     type (income/expense)    │
             │  │     note                     │           │     frequency                │
             │  │     tags[]                   │           │     start_date               │
             │  │     location                 │           │     next_occurrence          │
             │  │     recurring_transaction_id │           │     end_date                 │
             │  │     created_at               │           │     payment_status           │
             │  │     updated_at               │           │     is_active                │
             │  └──────────────┬────────────────┘           │     note                     │
             │                 │                            └──────────────────────────────┘
             │                 │ transaction_id (FK)
             │                 │
             │                 ▼
             │    ┌──────────────────────────────┐
             │    │   saving_contributions       │
             │    ├──────────────────────────────┤
             │    │ PK: id                       │
             │    │ FK: user_id                  │
             │    │ FK: saving_fund_id           │
             │    │ FK: transaction_id           │
             │    │     amount                   │
             │    │     contribution_date        │
             │    │     note                     │
             │    └──────────────┬────────────────┘
             │                   │
             │                   │ saving_fund_id (FK)
             │                   │
             │                   ▼
             │         ┌──────────────────────┐
             │         │   savings_funds      │
             │         ├──────────────────────┤
             │         │ PK: id               │
             │         │ FK: user_id          │
             └────────►│ FK: account_id       │
                       │     name             │
                       │     target_amount    │
                       │     current_amount   │◄──┐ Auto-updated
                       │     deadline         │   │ by trigger
                       │     icon             │   │
                       │     color            │   │
                       │     description      │   │
                       │     is_completed     │◄──┘ Auto-updated
                       └──────────────────────┘   by trigger


                    ┌──────────────────────┐
                    │      budgets         │
                    ├──────────────────────┤
                    │ PK: id               │
                    │ FK: user_id          │
                    │ FK: category_id      │───────┐
                    │     amount           │       │
                    │     period_start     │       │
                    │     period_end       │       │
                    │     alert_threshold  │       │
                    └──────────────────────┘       │
                                                   │
                                                   │
                                            ┌──────┴──────────┐
                                            │   categories    │
                                            │   (referenced)  │
                                            └─────────────────┘


                 ┌─────────────────────────┐
                 │   user_preferences      │
                 ├─────────────────────────┤
                 │ PK: user_id             │────────┐
                 │     default_currency    │        │
                 │     locale              │        │
                 │     theme               │        │
                 │     date_format         │        │
                 │     first_day_of_week   │        │
                 │     notification_enabled│        │
                 │     email_notifications │        │
                 └─────────────────────────┘        │
                                                    │
                                             ┌──────┴─────────┐
                                             │   auth.users   │
                                             │   (Supabase)   │
                                             └────────────────┘
```

---

## Relationship Details

### 1. **auth.users → All Tables**

- **Type**: One-to-Many
- **Cascade**: ON DELETE CASCADE
- **Description**: Mỗi user có nhiều records, xóa user → xóa tất cả dữ liệu

### 2. **accounts → transactions**

- **Type**: One-to-Many
- **Cascade**: ON DELETE SET NULL
- **Description**: Một account có nhiều transactions
- **Note**: Trigger auto-update balance

### 3. **categories → transactions**

- **Type**: One-to-Many
- **Cascade**: ON DELETE SET NULL
- **Description**: Một category có nhiều transactions
- **Note**: Type phải match (income/expense)

### 4. **categories → recurring_transactions**

- **Type**: One-to-Many
- **Cascade**: ON DELETE RESTRICT
- **Description**: Phải có category (NOT NULL)
- **Note**: Không cho xóa category còn recurring transaction

### 5. **accounts → savings_funds**

- **Type**: One-to-Many
- **Cascade**: ON DELETE SET NULL
- **Description**: Một account có nhiều savings funds

### 6. **savings_funds → saving_contributions**

- **Type**: One-to-Many
- **Cascade**: ON DELETE CASCADE
- **Description**: Xóa fund → xóa tất cả contributions
- **Note**: Trigger auto-update current_amount

### 7. **transactions → saving_contributions**

- **Type**: One-to-One (optional)
- **Cascade**: ON DELETE SET NULL
- **Description**: Link contribution với transaction gốc

### 8. **categories → budgets**

- **Type**: One-to-Many
- **Cascade**: ON DELETE CASCADE
- **Description**: Một category có nhiều budgets (theo period)

---

## Cardinality Summary

```
auth.users (1) ──────────── (N) accounts
auth.users (1) ──────────── (N) categories
auth.users (1) ──────────── (N) transactions
auth.users (1) ──────────── (N) recurring_transactions
auth.users (1) ──────────── (N) savings_funds
auth.users (1) ──────────── (N) saving_contributions
auth.users (1) ──────────── (N) budgets
auth.users (1) ──────────── (1) user_preferences

accounts (1) ───────────── (N) transactions
accounts (1) ───────────── (N) savings_funds
accounts (1) ───────────── (N) recurring_transactions

categories (1) ─────────── (N) transactions
categories (1) ─────────── (N) recurring_transactions
categories (1) ─────────── (N) budgets

savings_funds (1) ────────── (N) saving_contributions

transactions (1) ─────────── (0..1) saving_contributions
recurring_transactions (1) ─ (N) transactions (logical, via recurring_transaction_id)
```

---

## Key Constraints

### Primary Keys

All tables use UUID as PK:

```
accounts.id
categories.id
transactions.id
recurring_transactions.id
savings_funds.id
saving_contributions.id
budgets.id
user_preferences.user_id (also FK)
```

### Foreign Keys

```
All tables → auth.users(id)
transactions → accounts(id)
transactions → categories(id)
recurring_transactions → accounts(id)
recurring_transactions → categories(id)
savings_funds → accounts(id)
saving_contributions → savings_funds(id)
saving_contributions → transactions(id)
budgets → categories(id)
user_preferences → auth.users(id)
```

### Unique Constraints

```
accounts: (user_id, name)
categories: (user_id, name, type)
savings_funds: (user_id, name)
budgets: (user_id, category_id, period_start, period_end)
```

---

## Indexes Map

```
ACCOUNTS:
├── PK: id
├── FK: user_id
├── IDX: type
└── IDX: is_active

CATEGORIES:
├── PK: id
├── FK: user_id
├── IDX: type
└── IDX: is_active

TRANSACTIONS:
├── PK: id
├── FK: user_id
├── FK: account_id
├── FK: category_id
├── IDX: transaction_date (DESC)
├── IDX: type
├── IDX: created_at (DESC)
└── GIN: to_tsvector(note) -- Full-text search

RECURRING_TRANSACTIONS:
├── PK: id
├── FK: user_id
├── FK: category_id
├── FK: account_id
├── IDX: next_occurrence
├── IDX: is_active
└── IDX: payment_status

SAVINGS_FUNDS:
├── PK: id
├── FK: user_id
├── FK: account_id
└── IDX: is_completed

SAVING_CONTRIBUTIONS:
├── PK: id
├── FK: user_id
├── FK: saving_fund_id
├── FK: transaction_id
└── IDX: contribution_date (DESC)

BUDGETS:
├── PK: id
├── FK: user_id
├── FK: category_id
└── IDX: (period_start, period_end)
```

---

## Data Flow Diagrams

### Transaction Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ Creates transaction
     ▼
┌────────────────────┐
│   transactions     │ INSERT
└─────────┬──────────┘
          │
          │ TRIGGER: update_account_balance()
          ▼
     ┌────────┐
     │ UPDATE │ account.balance
     └────────┘
          │
          │ Auto-reflected in:
          ▼
┌──────────────────────────────┐
│ monthly_transaction_summary  │ VIEW
│ category_spending_summary    │ VIEW
│ account_balances_summary     │ VIEW
└──────────────────────────────┘
```

### Savings Contribution Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ Makes contribution
     ▼
┌──────────────────────┐
│ saving_contributions │ INSERT
└────────┬─────────────┘
         │
         │ TRIGGER: update_savings_fund_amount()
         ▼
    ┌────────┐
    │ UPDATE │ savings_fund.current_amount += amount
    └────┬───┘
         │
         │ Auto-check
         ▼
    ┌────────┐
    │ UPDATE │ savings_fund.is_completed
    └────────┘   = (current_amount >= target_amount)
         │
         │ Auto-reflected in:
         ▼
┌──────────────────┐
│ savings_progress │ VIEW
└──────────────────┘  + progress_percentage, days_remaining
```

### Recurring Transaction Payment

```
┌─────────┐
│  User   │
└────┬────┘
     │ Marks as paid
     ▼
┌──────────────────────────┐
│ recurring_transactions   │ UPDATE payment_status = 'paid'
└────────┬─────────────────┘
         │
         │ Application creates actual transaction
         ▼
┌──────────────────┐
│  transactions    │ INSERT (linked via recurring_transaction_id)
└────────┬─────────┘
         │
         │ TRIGGER: update_account_balance()
         ▼
    ┌────────┐
    │ UPDATE │ account.balance
    └────────┘
         │
         │ Application updates next_occurrence
         ▼
┌──────────────────────────┐
│ recurring_transactions   │ UPDATE next_occurrence
└──────────────────────────┘   based on frequency
```

---

## Security Layer (RLS)

```
┌──────────────────────────────────────────────┐
│         ROW LEVEL SECURITY POLICIES          │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ All tables have RLS enabled        │     │
│  └────────────────────────────────────┘     │
│                                              │
│  Policy Pattern (all tables):               │
│  ┌────────────────────────────────────┐     │
│  │ SELECT: WHERE user_id = auth.uid() │     │
│  │ INSERT: CHECK user_id = auth.uid() │     │
│  │ UPDATE: WHERE user_id = auth.uid() │     │
│  │ DELETE: WHERE user_id = auth.uid() │     │
│  └────────────────────────────────────┘     │
│                                              │
│  Tables covered:                             │
│  • accounts                                  │
│  • categories                                │
│  • transactions                              │
│  • recurring_transactions                    │
│  • savings_funds                             │
│  • saving_contributions                      │
│  • budgets                                   │
│  • user_preferences                          │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Trigger Chain Visualization

```
INSERT/UPDATE/DELETE on `transactions`
│
├─► TRIGGER: update_account_balance()
│   └─► UPDATE accounts.balance
│       └─► VIEW: account_balances_summary (auto-updated)
│
└─► TRIGGER: update_updated_at_column()
    └─► UPDATE transactions.updated_at = NOW()


INSERT/DELETE on `saving_contributions`
│
├─► TRIGGER: update_savings_fund_amount()
│   ├─► UPDATE savings_funds.current_amount
│   └─► UPDATE savings_funds.is_completed
│       └─► VIEW: savings_progress (auto-updated)
│
└─► No updated_at (table has no updated_at column)


UPDATE on any table with `updated_at` column
│
└─► TRIGGER: update_updated_at_column()
    └─► UPDATE {table}.updated_at = NOW()
```

---

## Schema Version History

| Version | Date     | Changes                               |
| ------- | -------- | ------------------------------------- |
| 1.0     | Jan 2026 | Initial complete schema               |
| -       | -        | Future migrations will be listed here |

---

**Generated by**: Database Documentation Tool  
**Last Updated**: January 2026
