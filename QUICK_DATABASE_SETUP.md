# 🚀 Quick Start - Database Setup

## Cách Nhanh Nhất Để Setup Database

### ⚡ Option 1: Supabase Dashboard (Dễ nhất - Recommended)

1. **Đăng nhập Supabase Dashboard**

   ```
   https://app.supabase.com
   ```

2. **Mở SQL Editor**
   - Click vào project của bạn
   - Chọn "SQL Editor" ở sidebar

3. **Chạy các file SQL theo thứ tự:**

   **Bước 1: Complete Schema**
   - Copy toàn bộ nội dung từ `supabase/migrations/000_complete_schema.sql`
   - Paste vào SQL Editor
   - Click "Run"
   - ✅ Đợi complete (khoảng 10-15 giây)

   **Bước 2: Seed Data & Functions**
   - Copy toàn bộ nội dung từ `supabase/migrations/001_seed_data.sql`
   - Paste vào SQL Editor
   - Click "Run"
   - ✅ Đợi complete

   **Bước 3: Backup Utilities**
   - Copy toàn bộ nội dung từ `supabase/migrations/002_backup_utilities.sql`
   - Paste vào SQL Editor
   - Click "Run"
   - ✅ Đợi complete

4. **Verify Setup**

   ```sql
   -- Run trong SQL Editor để check:
   SELECT
       schemaname,
       tablename
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

   Bạn phải thấy 8 tables:
   - accounts
   - budgets
   - categories
   - recurring_transactions
   - saving_contributions
   - savings_funds
   - transactions
   - user_preferences

5. **Test User Initialization**

   ```sql
   -- Replace 'YOUR_USER_ID' với user_id thực tế từ auth.users
   SELECT initialize_new_user('YOUR_USER_ID');

   -- Check kết quả:
   SELECT * FROM accounts WHERE user_id = 'YOUR_USER_ID';
   SELECT * FROM categories WHERE user_id = 'YOUR_USER_ID';
   ```

✅ **DONE! Database đã sẵn sàng!**

---

### 🛠️ Option 2: Supabase CLI

```bash
# 1. Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# 2. Login (nếu chưa login)
supabase login

# 3. Link project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Apply migrations
supabase db push

# 5. Verify
supabase db remote commit
```

---

## 📝 Sau Khi Setup

### 1. Test Functions

```sql
-- Test get statistics
SELECT get_user_statistics('your-user-id');

-- Test get account summary
SELECT * FROM get_account_summary('your-user-id');

-- Test validate data
SELECT * FROM validate_user_data('your-user-id');
```

### 2. Test Views

```sql
-- Account balances summary
SELECT * FROM account_balances_summary WHERE user_id = 'your-user-id';

-- Monthly transactions
SELECT * FROM monthly_transaction_summary WHERE user_id = 'your-user-id';

-- Category spending
SELECT * FROM category_spending_summary WHERE user_id = 'your-user-id';

-- Savings progress
SELECT * FROM savings_progress WHERE user_id = 'your-user-id';
```

### 3. (Optional) Generate Test Data

```sql
-- Tạo 100 transactions mẫu để test
SELECT generate_sample_data('your-user-id', 100);

-- Check lại
SELECT COUNT(*) FROM transactions WHERE user_id = 'your-user-id';
```

---

## 🔧 Troubleshooting

### Error: "extension uuid-ossp does not exist"

**Solution:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Chạy command này trước khi chạy schema.

### Error: "permission denied"

**Solution:** Đảm bảo bạn đang login với account có quyền admin của project.

### Error: "table already exists"

**Solution:**

```sql
-- Drop tất cả tables (CẨNTHẬN: sẽ xóa hết data!)
DROP TABLE IF EXISTS saving_contributions CASCADE;
DROP TABLE IF EXISTS savings_funds CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Sau đó chạy lại migration
```

### RLS Policies Not Working

**Check:**

```sql
-- Kiểm tra RLS có enabled không
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Kiểm tra policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 📊 Verify Complete Setup

Chạy script này để verify tất cả:

```sql
-- 1. Check tables
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'accounts', 'categories', 'transactions',
    'recurring_transactions', 'savings_funds',
    'saving_contributions', 'budgets', 'user_preferences'
  );
-- Expected: 8

-- 2. Check views
SELECT COUNT(*) as view_count
FROM information_schema.views
WHERE table_schema = 'public';
-- Expected: >= 4

-- 3. Check functions
SELECT COUNT(*) as function_count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';
-- Expected: >= 13

-- 4. Check triggers
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Expected: >= 9

-- 5. Check RLS policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected: 4 policies per table

-- 6. Check indexes
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public';
-- Expected: >= 25
```

Nếu tất cả đều pass → **Setup hoàn tất! ✅**

---

## 🎯 Next Steps

1. **Update Application Code**
   - Các TypeScript interfaces trong `src/services/*.service.ts` đã match với schema
   - Không cần thay đổi gì

2. **Test User Flow**
   - Signup user mới
   - Verify default categories & accounts được tạo
   - Test CRUD operations

3. **Setup Auto-Initialize** (Optional)
   - Uncomment trigger trong `001_seed_data.sql`
   - Auto tạo default data khi user signup

4. **Configure Backup**
   - Setup scheduled backups
   - Test restore process

---

## 📚 More Information

- **Full Documentation**: `docs/database-schema.md`
- **ERD Diagrams**: `docs/database-erd.md`
- **Complete Guide**: `docs/database-package-summary.md`
- **Migration Guide**: `supabase/migrations/README.md`

---

**Setup Time**: ~5-10 phút  
**Difficulty**: ⭐⭐ (Easy)  
**Status**: Ready to use ✅
