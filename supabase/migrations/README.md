# Database Migrations - Financial Management Application

## 📋 Overview

Thư mục này chứa các file migration để tạo và quản lý database schema cho ứng dụng quản lý tài chính.

## 🗂️ Files

### 1. `000_complete_schema.sql`

File schema chính chứa toàn bộ cấu trúc database:

**Tables:**

- `accounts` - Tài khoản tài chính (tiền mặt, ngân hàng, thẻ tín dụng)
- `categories` - Danh mục thu/chi
- `transactions` - Giao dịch tài chính
- `recurring_transactions` - Giao dịch định kỳ (hóa đơn, lương, v.v.)
- `savings_funds` - Mục tiêu tiết kiệm
- `saving_contributions` - Khoản đóng góp vào quỹ tiết kiệm
- `budgets` - Ngân sách theo danh mục
- `user_preferences` - Cài đặt người dùng

**Features:**

- ✅ Indexes để tối ưu hiệu suất query
- ✅ Triggers tự động cập nhật timestamps
- ✅ Triggers tự động cập nhật số dư tài khoản
- ✅ Row Level Security (RLS) policies
- ✅ Views để aggregate dữ liệu
- ✅ Constraints để đảm bảo tính toàn vẹn dữ liệu
- ✅ Comments để document database

### 2. `001_seed_data.sql`

File seed dữ liệu và utility functions:

**Functions:**

- `initialize_new_user()` - Khởi tạo user mới với dữ liệu mặc định
- `get_account_summary()` - Lấy tổng quan số dư tài khoản
- `get_monthly_spending()` - Lấy chi tiêu hàng tháng theo danh mục
- `get_savings_progress()` - Lấy tiến độ mục tiêu tiết kiệm
- `get_upcoming_recurring()` - Lấy giao dịch định kỳ sắp tới
- `recalculate_account_balances()` - Tính lại số dư tài khoản

## 🚀 How to Use

### Option 1: Supabase CLI (Recommended)

1. **Cài đặt Supabase CLI:**

```bash
npm install -g supabase
```

2. **Link project với Supabase:**

```bash
supabase link --project-ref your-project-ref
```

3. **Apply migrations:**

```bash
supabase db push
```

### Option 2: Supabase Dashboard

1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Copy nội dung từ `000_complete_schema.sql`
4. Run query
5. Lặp lại với `001_seed_data.sql`

### Option 3: Direct PostgreSQL

```bash
# Connect to your database
psql postgresql://user:password@host:port/database

# Run migrations
\i supabase/migrations/000_complete_schema.sql
\i supabase/migrations/001_seed_data.sql
```

## 📊 Database Schema Diagram

```
┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
└────────┬────────┘
         │
         │ user_id (FK)
         │
         ├─────────────────────────────────────────────────────────┐
         │                                                         │
         ▼                                                         ▼
┌─────────────────┐                                      ┌─────────────────┐
│    accounts     │                                      │   categories    │
├─────────────────┤                                      ├─────────────────┤
│ id (PK)         │                                      │ id (PK)         │
│ user_id (FK)    │                                      │ user_id (FK)    │
│ name            │                                      │ name            │
│ type            │                                      │ type            │
│ balance         │                                      │ icon            │
│ currency        │                                      │ color           │
└────────┬────────┘                                      └────────┬────────┘
         │                                                        │
         │ account_id (FK)                      category_id (FK)  │
         │                                                        │
         └──────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   transactions      │
                    ├─────────────────────┤
                    │ id (PK)             │
                    │ user_id (FK)        │
                    │ account_id (FK)     │
                    │ category_id (FK)    │
                    │ amount              │
                    │ type                │
                    │ transaction_date    │
                    │ note                │
                    └─────────────────────┘

         ┌────────────────────────────────────────────┐
         │                                            │
         ▼                                            ▼
┌─────────────────────────┐              ┌─────────────────────────┐
│ recurring_transactions  │              │     savings_funds       │
├─────────────────────────┤              ├─────────────────────────┤
│ id (PK)                 │              │ id (PK)                 │
│ user_id (FK)            │              │ user_id (FK)            │
│ category_id (FK)        │              │ name                    │
│ account_id (FK)         │              │ target_amount           │
│ name                    │              │ current_amount          │
│ amount                  │              │ deadline                │
│ frequency               │              │ account_id (FK)         │
│ next_occurrence         │              └──────────┬──────────────┘
│ payment_status          │                         │
└─────────────────────────┘                         │
                                                    │ saving_fund_id (FK)
                                                    │
                                                    ▼
                                        ┌─────────────────────────┐
                                        │  saving_contributions   │
                                        ├─────────────────────────┤
                                        │ id (PK)                 │
                                        │ user_id (FK)            │
                                        │ saving_fund_id (FK)     │
                                        │ transaction_id (FK)     │
                                        │ amount                  │
                                        │ contribution_date       │
                                        └─────────────────────────┘
```

## 🔐 Row Level Security (RLS)

Tất cả các bảng đều có RLS policies để đảm bảo:

- ✅ Users chỉ có thể xem/sửa/xóa dữ liệu của chính họ
- ✅ Không thể truy cập dữ liệu của users khác
- ✅ Tự động áp dụng `user_id` filter ở database layer

## 🎯 Default Data

Khi user mới đăng ký, hệ thống tự động tạo:

**3 Accounts:**

- 💵 Cash (Tiền mặt)
- 🏦 Bank Account (Tài khoản ngân hàng)
- 💳 Credit Card (Thẻ tín dụng)

**5 Income Categories:**

- 💼 Salary (Lương)
- 💻 Freelance
- 📈 Investment (Đầu tư)
- 🎁 Gift (Quà tặng)
- 💰 Other Income (Thu nhập khác)

**9 Expense Categories:**

- 🍔 Food & Dining (Ăn uống)
- 🚗 Transportation (Di chuyển)
- 🛍️ Shopping (Mua sắm)
- 🎬 Entertainment (Giải trí)
- 📄 Bills & Utilities (Hóa đơn)
- 🏥 Healthcare (Y tế)
- 📚 Education (Giáo dục)
- 🏠 Housing (Nhà ở)
- 💸 Other Expense (Chi phí khác)

## 🔧 Maintenance

### Recalculate Account Balances

Nếu số dư tài khoản bị sai lệch, chạy:

```sql
SELECT recalculate_account_balances('user_id_here');
-- Or for all users:
SELECT recalculate_account_balances();
```

### Initialize User Manually

```sql
SELECT initialize_new_user('user_id_here');
```

## 📝 Notes

1. **Auto-initialize trigger**: Đã có sẵn function nhưng trigger đang bị comment. Nếu muốn tự động khởi tạo user khi signup, uncomment trigger trong `001_seed_data.sql`

2. **Balance Updates**: Số dư tài khoản được tự động cập nhật khi có transaction mới/sửa/xóa thông qua trigger `update_account_balance_trigger`

3. **Timestamps**: Các trường `updated_at` tự động cập nhật khi record được modify

4. **Currency**: Mặc định là VND, có thể thay đổi trong `user_preferences`

## 🐛 Troubleshooting

### Migration fails

- Kiểm tra Supabase project có đủ quyền
- Đảm bảo extensions đã được enable
- Chạy từng file một để debug

### RLS policies not working

- Kiểm tra `auth.uid()` có return đúng user_id không
- Verify user đã authenticated

### Triggers not firing

- Check PostgreSQL version (yêu cầu >= 12)
- Xem logs trong Supabase Dashboard

## 📚 References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: January 2026  
**Version**: 1.0
