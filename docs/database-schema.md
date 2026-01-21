# 📊 Database Schema Documentation

## Tổng Quan

Database schema cho ứng dụng quản lý tài chính cá nhân với đầy đủ tính năng:

- Multi-user support với Row Level Security (RLS)
- Multi-currency support
- Tự động tracking balance
- Audit trails
- Data integrity constraints

---

## 📁 Bảng Dữ Liệu (Tables)

### 1. **accounts** - Tài Khoản Tài Chính

Lưu trữ các tài khoản tài chính của người dùng.

| Column      | Type          | Description                                               |
| ----------- | ------------- | --------------------------------------------------------- |
| id          | UUID          | Primary key                                               |
| user_id     | UUID          | Foreign key to auth.users                                 |
| name        | VARCHAR(255)  | Tên tài khoản                                             |
| type        | VARCHAR(50)   | Loại: cash, bank, credit_card, savings, investment, other |
| balance     | DECIMAL(15,2) | Số dư hiện tại (auto-updated)                             |
| currency    | VARCHAR(10)   | Mã tiền tệ (VND, USD, etc.)                               |
| description | TEXT          | Mô tả                                                     |
| icon        | VARCHAR(50)   | Icon emoji                                                |
| color       | VARCHAR(7)    | Màu sắc (hex code)                                        |
| is_active   | BOOLEAN       | Đang hoạt động?                                           |
| created_at  | TIMESTAMP     | Thời gian tạo                                             |
| updated_at  | TIMESTAMP     | Thời gian cập nhật (auto-updated)                         |

**Constraints:**

- Unique: (user_id, name)
- type phải nằm trong danh sách cho phép

**Indexes:**

- idx_accounts_user_id
- idx_accounts_type
- idx_accounts_is_active

---

### 2. **categories** - Danh Mục Thu/Chi

Phân loại các giao dịch thu nhập và chi tiêu.

| Column      | Type         | Description               |
| ----------- | ------------ | ------------------------- |
| id          | UUID         | Primary key               |
| user_id     | UUID         | Foreign key to auth.users |
| name        | VARCHAR(255) | Tên danh mục              |
| type        | VARCHAR(10)  | income hoặc expense       |
| icon        | VARCHAR(50)  | Icon emoji                |
| color       | VARCHAR(7)   | Màu sắc (hex code)        |
| description | TEXT         | Mô tả                     |
| is_active   | BOOLEAN      | Đang hoạt động?           |
| created_at  | TIMESTAMP    | Thời gian tạo             |
| updated_at  | TIMESTAMP    | Thời gian cập nhật        |

**Constraints:**

- Unique: (user_id, name, type)
- type IN ('income', 'expense')

**Indexes:**

- idx_categories_user_id
- idx_categories_type
- idx_categories_is_active

---

### 3. **transactions** - Giao Dịch

Lưu trữ tất cả giao dịch thu chi.

| Column                   | Type          | Description                                    |
| ------------------------ | ------------- | ---------------------------------------------- |
| id                       | UUID          | Primary key                                    |
| user_id                  | UUID          | Foreign key to auth.users                      |
| account_id               | UUID          | Foreign key to accounts                        |
| category_id              | UUID          | Foreign key to categories                      |
| amount                   | DECIMAL(15,2) | Số tiền (>= 0)                                 |
| type                     | VARCHAR(10)   | income hoặc expense                            |
| transaction_date         | DATE          | Ngày giao dịch                                 |
| note                     | TEXT          | Ghi chú                                        |
| tags                     | TEXT[]        | Array các tags                                 |
| location                 | VARCHAR(255)  | Địa điểm                                       |
| recurring_transaction_id | UUID          | Link to recurring transaction nếu auto-created |
| created_at               | TIMESTAMP     | Thời gian tạo                                  |
| updated_at               | TIMESTAMP     | Thời gian cập nhật                             |

**Constraints:**

- amount >= 0
- type IN ('income', 'expense')
- Category type phải match với transaction type

**Indexes:**

- idx_transactions_user_id
- idx_transactions_account_id
- idx_transactions_category_id
- idx_transactions_date (DESC)
- idx_transactions_type
- idx_transactions_created_at (DESC)
- idx_transactions_note_search (GIN, full-text search)

**Triggers:**

- Auto-update account balance khi INSERT/UPDATE/DELETE
- Auto-update timestamps

---

### 4. **recurring_transactions** - Giao Dịch Định Kỳ

Lưu trữ các giao dịch lặp lại như hóa đơn, lương, v.v.

| Column          | Type          | Description                          |
| --------------- | ------------- | ------------------------------------ |
| id              | UUID          | Primary key                          |
| user_id         | UUID          | Foreign key to auth.users            |
| name            | VARCHAR(255)  | Tên giao dịch định kỳ                |
| amount          | DECIMAL(15,2) | Số tiền                              |
| type            | VARCHAR(10)   | income hoặc expense                  |
| category_id     | UUID          | Foreign key to categories (NOT NULL) |
| account_id      | UUID          | Foreign key to accounts              |
| frequency       | VARCHAR(20)   | daily, weekly, monthly, yearly       |
| start_date      | DATE          | Ngày bắt đầu                         |
| next_occurrence | DATE          | Ngày lần lặp tiếp theo               |
| end_date        | DATE          | Ngày kết thúc (nullable)             |
| payment_status  | VARCHAR(10)   | paid hoặc unpaid                     |
| is_active       | BOOLEAN       | Đang hoạt động?                      |
| note            | TEXT          | Ghi chú                              |
| created_at      | TIMESTAMP     | Thời gian tạo                        |
| updated_at      | TIMESTAMP     | Thời gian cập nhật                   |

**Constraints:**

- amount >= 0
- type IN ('income', 'expense')
- frequency IN ('daily', 'weekly', 'monthly', 'yearly')
- payment_status IN ('paid', 'unpaid')
- end_date >= start_date (nếu có)

**Indexes:**

- idx_recurring_transactions_user_id
- idx_recurring_transactions_category_id
- idx_recurring_transactions_next_occurrence
- idx_recurring_transactions_is_active
- idx_recurring_transactions_payment_status

---

### 5. **savings_funds** - Mục Tiêu Tiết Kiệm

Lưu trữ các mục tiêu tiết kiệm của người dùng.

| Column         | Type          | Description                     |
| -------------- | ------------- | ------------------------------- |
| id             | UUID          | Primary key                     |
| user_id        | UUID          | Foreign key to auth.users       |
| name           | VARCHAR(255)  | Tên mục tiêu                    |
| target_amount  | DECIMAL(15,2) | Số tiền mục tiêu (> 0)          |
| current_amount | DECIMAL(15,2) | Số tiền hiện tại (auto-updated) |
| deadline       | DATE          | Deadline (nullable)             |
| account_id     | UUID          | Foreign key to accounts         |
| icon           | VARCHAR(50)   | Icon emoji                      |
| color          | VARCHAR(7)    | Màu sắc                         |
| description    | TEXT          | Mô tả                           |
| is_completed   | BOOLEAN       | Đã hoàn thành? (auto-updated)   |
| created_at     | TIMESTAMP     | Thời gian tạo                   |
| updated_at     | TIMESTAMP     | Thời gian cập nhật              |

**Constraints:**

- Unique: (user_id, name)
- target_amount > 0
- current_amount >= 0

**Indexes:**

- idx_savings_funds_user_id
- idx_savings_funds_account_id
- idx_savings_funds_is_completed

**Triggers:**

- Auto-update current_amount khi có contribution mới
- Auto-update is_completed khi đạt target

---

### 6. **saving_contributions** - Đóng Góp Tiết Kiệm

Lưu trữ các lần đóng góp vào quỹ tiết kiệm.

| Column            | Type          | Description                            |
| ----------------- | ------------- | -------------------------------------- |
| id                | UUID          | Primary key                            |
| user_id           | UUID          | Foreign key to auth.users              |
| saving_fund_id    | UUID          | Foreign key to savings_funds           |
| transaction_id    | UUID          | Foreign key to transactions (nullable) |
| amount            | DECIMAL(15,2) | Số tiền đóng góp (> 0)                 |
| contribution_date | DATE          | Ngày đóng góp                          |
| note              | TEXT          | Ghi chú                                |
| created_at        | TIMESTAMP     | Thời gian tạo                          |

**Constraints:**

- amount > 0
- CASCADE delete khi xóa savings_fund

**Indexes:**

- idx_saving_contributions_user_id
- idx_saving_contributions_fund_id
- idx_saving_contributions_transaction_id
- idx_saving_contributions_date (DESC)

**Triggers:**

- Auto-update savings_fund current_amount

---

### 7. **budgets** - Ngân Sách

Lưu trữ ngân sách theo danh mục và thời gian.

| Column          | Type          | Description               |
| --------------- | ------------- | ------------------------- |
| id              | UUID          | Primary key               |
| user_id         | UUID          | Foreign key to auth.users |
| category_id     | UUID          | Foreign key to categories |
| amount          | DECIMAL(15,2) | Số tiền ngân sách (> 0)   |
| period_start    | DATE          | Ngày bắt đầu kỳ           |
| period_end      | DATE          | Ngày kết thúc kỳ          |
| alert_threshold | DECIMAL(5,2)  | Ngưỡng cảnh báo (%)       |
| created_at      | TIMESTAMP     | Thời gian tạo             |
| updated_at      | TIMESTAMP     | Thời gian cập nhật        |

**Constraints:**

- Unique: (user_id, category_id, period_start, period_end)
- amount > 0
- period_end > period_start
- alert_threshold: 0-100

**Indexes:**

- idx_budgets_user_id
- idx_budgets_category_id
- idx_budgets_period

---

### 8. **user_preferences** - Cài Đặt Người Dùng

Lưu trữ preferences của từng user.

| Column               | Type        | Description                   |
| -------------------- | ----------- | ----------------------------- |
| user_id              | UUID        | Primary key, FK to auth.users |
| default_currency     | VARCHAR(10) | Tiền tệ mặc định              |
| locale               | VARCHAR(10) | Ngôn ngữ (vi, en, etc.)       |
| theme                | VARCHAR(20) | Giao diện: light, dark, auto  |
| date_format          | VARCHAR(20) | Format ngày tháng             |
| first_day_of_week    | INTEGER     | Ngày đầu tuần (0-6)           |
| notification_enabled | BOOLEAN     | Bật thông báo?                |
| email_notifications  | BOOLEAN     | Bật email notifications?      |
| created_at           | TIMESTAMP   | Thời gian tạo                 |
| updated_at           | TIMESTAMP   | Thời gian cập nhật            |

**Constraints:**

- theme IN ('light', 'dark', 'auto')
- first_day_of_week: 0-6

---

## 🔍 Views (Aggregated Data)

### account_balances_summary

Tổng hợp số dư theo loại tài khoản.

```sql
SELECT * FROM account_balances_summary WHERE user_id = 'xxx';
```

**Columns:**

- user_id
- total_accounts
- total_balance
- cash_balance
- bank_balance
- credit_balance
- savings_balance

---

### monthly_transaction_summary

Tổng hợp giao dịch theo tháng.

```sql
SELECT * FROM monthly_transaction_summary
WHERE user_id = 'xxx'
ORDER BY month DESC;
```

**Columns:**

- user_id
- month
- total_income
- total_expense
- net_amount
- transaction_count

---

### category_spending_summary

Chi tiêu theo danh mục.

```sql
SELECT * FROM category_spending_summary
WHERE user_id = 'xxx'
ORDER BY total_amount DESC;
```

**Columns:**

- user_id
- category_id
- category_name
- category_type
- icon
- color
- transaction_count
- total_amount
- avg_amount

---

### savings_progress

Tiến độ mục tiêu tiết kiệm.

```sql
SELECT * FROM savings_progress WHERE user_id = 'xxx';
```

**Columns:**

- Tất cả columns từ savings_funds
- progress_percentage (%)
- days_remaining
- contribution_count

---

## ⚡ Functions

### User Initialization

```sql
-- Khởi tạo user mới với dữ liệu mặc định
SELECT initialize_new_user('user-uuid');
```

### Statistics

```sql
-- Lấy thống kê tổng quan
SELECT get_user_statistics('user-uuid');

-- Lấy tổng quan tài khoản
SELECT * FROM get_account_summary('user-uuid');

-- Lấy chi tiêu tháng hiện tại
SELECT * FROM get_monthly_spending('user-uuid', CURRENT_DATE);

-- Lấy tiến độ tiết kiệm
SELECT * FROM get_savings_progress('user-uuid');

-- Lấy giao dịch định kỳ sắp tới
SELECT * FROM get_upcoming_recurring('user-uuid', 30); -- 30 days
```

### Backup & Restore

```sql
-- Export dữ liệu user
SELECT export_user_data('user-uuid');

-- Tạo backup snapshot
SELECT * FROM create_backup_snapshot('user-uuid');
```

### Validation

```sql
-- Validate data integrity
SELECT * FROM validate_user_data('user-uuid');
```

### Maintenance

```sql
-- Tính lại số dư tài khoản
SELECT recalculate_account_balances('user-uuid');

-- Xóa giao dịch trùng lặp
SELECT remove_duplicate_transactions('user-uuid');
```

### Testing

```sql
-- Tạo dữ liệu mẫu cho testing
SELECT generate_sample_data('user-uuid', 100); -- 100 transactions
```

---

## 🔒 Security (RLS Policies)

Tất cả các bảng đều có Row Level Security enabled với policies:

- ✅ **SELECT**: Users chỉ xem được dữ liệu của mình
- ✅ **INSERT**: Users chỉ tạo được dữ liệu cho mình
- ✅ **UPDATE**: Users chỉ sửa được dữ liệu của mình
- ✅ **DELETE**: Users chỉ xóa được dữ liệu của mình

Sử dụng `auth.uid()` để tự động filter theo user_id.

---

## 🚀 Triggers & Auto-Updates

### 1. **update_updated_at_column()**

Tự động cập nhật `updated_at` khi record được UPDATE.

**Áp dụng cho:**

- accounts
- categories
- transactions
- recurring_transactions
- savings_funds
- budgets
- user_preferences

### 2. **update_account_balance()**

Tự động cập nhật số dư tài khoản khi có giao dịch mới/sửa/xóa.

**Logic:**

- INSERT transaction income → balance + amount
- INSERT transaction expense → balance - amount
- UPDATE transaction → revert old + apply new
- DELETE transaction → revert

### 3. **update_savings_fund_amount()**

Tự động cập nhật current_amount và is_completed khi có contribution mới.

**Logic:**

- INSERT contribution → current_amount + amount
- DELETE contribution → current_amount - amount
- Check if current_amount >= target_amount → set is_completed

---

## 📈 Performance Optimization

### Indexes Created

- **User filtering**: All tables có index trên user_id
- **Date queries**: Index trên transaction_date, next_occurrence, contribution_date
- **Type filtering**: Index trên type, is_active, payment_status
- **Full-text search**: GIN index trên transaction note
- **Foreign keys**: Index trên tất cả FK columns

### Query Optimization Tips

1. Luôn filter theo user_id đầu tiên (RLS tự động làm)
2. Sử dụng date range filters thay vì functions trên dates
3. Sử dụng views đã tạo sẵn cho aggregations
4. Limit kết quả khi không cần tất cả records

---

## 📝 Data Flow Examples

### Tạo Giao Dịch Mới

```
1. User tạo transaction (INSERT vào transactions)
2. Trigger tự động update account balance
3. View monthly_transaction_summary tự động include transaction mới
4. Statistics functions reflect transaction mới
```

### Đóng Góp Vào Savings

```
1. User tạo contribution (INSERT vào saving_contributions)
2. Trigger tự động update savings_fund.current_amount
3. Trigger tự động check và update is_completed nếu đạt target
4. View savings_progress reflect progress mới
```

### Recurring Transaction Được Paid

```
1. User toggle payment_status từ 'unpaid' → 'paid'
2. Application tạo transaction thực trong transactions table
3. Trigger update account balance
4. Application update next_occurrence dựa trên frequency
```

---

## 🎯 Default Data

Khi user mới signup, tự động tạo:

**3 Accounts:**

- 💵 Cash (Tiền mặt)
- 🏦 Bank Account (Tài khoản ngân hàng)
- 💳 Credit Card (Thẻ tín dụng)

**5 Income Categories:**

- 💼 Salary
- 💻 Freelance
- 📈 Investment
- 🎁 Gift
- 💰 Other Income

**9 Expense Categories:**

- 🍔 Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 📄 Bills & Utilities
- 🏥 Healthcare
- 📚 Education
- 🏠 Housing
- 💸 Other Expense

---

## 🔧 Maintenance Schedule

### Daily

- Monitor RLS policies performance
- Check for failed triggers

### Weekly

- Analyze slow queries
- Review index usage

### Monthly

- Vacuum and analyze tables
- Archive old data (optional)

### Quarterly

- Run data integrity checks
- Review and optimize indexes

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-constraints.html)

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Development Team
